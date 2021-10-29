import { dosemu, dosemuSound } from "../common/node_modules/dosemu/index.js";
import * as bomberman from "../common/bomberman.js";
import * as client from "./client.js";

import * as socket from "./socket.js";
import { addPlayerToLobby, attachCallbackToJoinButtonClick, attachCallbackToUserReadyCheckbox, changePlayerStatus, createJoinElements, createLobbyElement, deleteJoinDOMElement, deleteLobbyDOMElement, deleteUserDomElement, getJoinInputValue } from "./dom-elements.service.js";
import { LobbyUserStatus } from "./lobby-user.status.js";

//---------------------------------------------------------------------------------

let lastTime = new Date().getTime();

/** @type {HTMLElement} */
let gameScreenDOMElement;
/** @type string */
let userIdentityId = undefined;
/** @type {number} */
let userSpawnSlot = null;

/**
 * @type {{
 *		nickname: string,
 *		status: "loading" | "ready",
 *		userIdentityId: string
 * }[]}
 */
let lobbyUsers = [];

function initJoinGame() {
	gameScreenDOMElement = document.getElementById("game-screen");
	showJoinScreen();
	subscribeToSocketEvents();
}

function initGame() {
	// init dosemu:
	dosemu.init(document.querySelector("#emuscreen"), null);
	dosemu.hideMouse();
	bomberman.init(client);
}

/** @param {number[][]} map */
function startRound(map) {
	bomberman.reset();
	bomberman.selectMap(map);
	socket.joinGame();

	// start game loop:
	requestAnimationFrame(step);
}

function startGame() {
	bomberman.startGame(userSpawnSlot);
}

function step() {

	draw();

	const now = new Date().getTime();
	const dt = Math.min(0.1, (now-lastTime)/1000);
	bomberman.update(dt);
	dosemuSound.update(dt);
	lastTime = now;

	requestAnimationFrame(step);
}

function draw() {
	dosemu.clearScreen();
	bomberman.draw();
}

/** @returns {Promise<number>} the resolved value is the slot id */
function joinedLobby() {
	let resolveFn;
	const joinPromise = new Promise((resolve, reject) => {
		resolveFn = resolve;
	});

	attachCallbackToJoinButtonClick((ev) => {
		const nickname = getJoinInputValue();
		if (!nickname) {
			return;
		}
		socket.joinLobby(nickname).then(resolveFn);
	});

	return joinPromise;
}

function showLobbyScreen() {
	resetGameScreen();
	gameScreenDOMElement.appendChild(
		createLobbyElement()
	);
	socket.getUsersFromLobby().then((users) => {
		addUsersToLobby(users, userIdentityId);
		attachCallbackToUserReadyCheckbox(userIdentityId, (event, element) => {
			if (event.currentTarget.checked) {
				element.disabled  = true;
			}
			socket.sendPlayerReady();
		});
	});
}

function showJoinScreen() {
	resetGameScreen();
	gameScreenDOMElement.appendChild(
		createJoinElements()
	);
}

function resetGameScreen() {
	deleteJoinDOMElement();
	deleteLobbyDOMElement();
}

function subscribeToSocketEvents() {
	socket.socketConnected().subscribe(() => {
		joinedLobby().then((slotId) => {
			showLobbyScreen();
			userSpawnSlot = slotId;
		});
	});
	socket.requestUserIdentity().subscribe((newUserIdentityId) => {
		userIdentityId = newUserIdentityId;
	});
	socket.onUserJoindLobby().subscribe((user) => {
		addUsersToLobby([user], userIdentityId);
	});

	socket.onUserDisconnected().subscribe((userIdentityId) => {
		deleteUserDomElement(userIdentityId);
	});

	socket.onPlayerReady((userIdentityId) => {
		changePlayerStatus(userIdentityId, LobbyUserStatus.READY);
	});

	socket.onStartRound(/** @param {number[][]} map */(map) => {
		gameScreenDOMElement.remove();
		gameScreenDOMElement = null;
		initGame();
		startRound(map);
	});

	socket.onStartGame(startGame);
}

function addUsersToLobby(users, userIdentityId) {
	if (!userIdentityId || !gameScreenDOMElement) {
		return;
	}
	for (const user of users) {
		if ((!user || isUserInLobby(user))) {
			return;
		}
		addPlayerToLobby(user.nickname, user.status, user.userIdentityId, userIdentityId)
		lobbyUsers.push(user);
	}
}

function isUserInLobby(user) {
	for (const currentUser of lobbyUsers) {
		if (user.userIdentityId === currentUser.userIdentityId) {
			return true;
		}
	}
	return false;
}

(function main() {
	document.onreadystatechange = () => {
		initJoinGame();
	};
})();
