import { dosemu, dosemuSound } from "./node_modules/dosemu/index.js";
import * as bomberman from "./bomberman.js";

import * as socket from "./socket.js";
import { addPlayerToLobby, attachCallbackToJoinButtonClick, attachCallbackToUserReadyCheckbox, changePlayerStatus, createJoinElements, createLobbyElement, deleteJoinDOMElement, deleteLobbyDOMElement, deleteUserDomElement, getJoinInputValue } from "./dom-elements.service.js";
import { LobbyUserStatus } from "./lobby-user.status.js";

let lastTime = new Date().getTime();

let gameScreenDOMElement;

/**
 * @type string
 */
let userIdentityId = undefined;

/**
 * @type [
 *		nickname,
*		status: "loading", "ready",
*		userIdentityId
* ]
*/
let lobbyUsers = [];

function initJoinGame() {
	gameScreenDOMElement = document.getElementById("game-screen");
	showJoinScreen();
	subscribeToSocketEvents();
}

function initGame() {
	dosemu.init(document.querySelector("#emuscreen"), null);
	// dosemu.setNoiseStrength(0);
	requestAnimationFrame(step);
	dosemu.hideMouse();
	bomberman.init();
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
		socket.joinLobby(nickname).then(() => resolveFn());
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
		joinedLobby().then(() => showLobbyScreen());
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

	socket.onPlayerReady().subscribe((userIdentityId) => {
		changePlayerStatus(userIdentityId, LobbyUserStatus.READY);
	});
}

function addUsersToLobby(users, userIdentityId) {
	if (!userIdentityId) {
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
