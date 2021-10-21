import { dosemu, dosemuSound } from "../common/node_modules/dosemu/index.js";
import * as bomberman from "../common/bomberman.js";
import { generateRandomMap } from "../common/random-map.js";
import * as constants from "../common/constants.js";
import * as client from "./client.js";

import * as socket from "./socket.js";

//---------------------------------------------------------------------------------

class GameDetails {
	/** @type {number[][]} */
	map;
	/** @type {number} */
	playerSlot;
}

let lastTime = new Date().getTime();

/** @type {string} */
 let sessionId = undefined;

async function init() {
	// set up network:
	subscribeToSocketEvents();
	// join a game:
	await join();
	removeJoinScreen();

	// init dosemu:
	dosemu.init(document.querySelector("#emuscreen"), null);
	// dosemu.setNoiseStrength(0);
	dosemu.hideMouse();

	// init game:
	bomberman.init(client);

	receiveGameDetails().then(
		/** @param {GameDetails} gameDetails */
		(gameDetails) => startRound(gameDetails.map, gameDetails.playerSlot)
	);
}

function subscribeToSocketEvents() {
	socket.requestUserIdentity().subscribe((userSessionId) => {
		sessionId = userSessionId;
	});

	socket.onUserJoindGame().subscribe((userJoinDetails) => {
		// create user list. This list will be passed to bomberman.init() fn from init()
	});
}

/** @returns {Promise<GameDetails>} */
function receiveGameDetails() {
	// TODO request this from the server
	// TODO for now we'll hardcode them
	const map = generateRandomMap(constants.DEFAULT_MAP_ROWS, constants.DEFAULT_MAP_COLS);
	return Promise.resolve({
		map,
		playerSlot: 0
	});
}

/** @param {number[][]} map */
function startRound(map, playerSlot) {
	bomberman.reset();
	bomberman.startGame(map, playerSlot);

	// start game loop:
	requestAnimationFrame(step);
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

function join() {
	let resolveFn;
	const joinPromise = new Promise((resolve, reject) => {
		resolveFn = resolve;
	});

	const joinButton = document.getElementById("join-button");

	joinButton.addEventListener("click", (ev) => {
		const inputText = document.getElementById("join-textbox");
		if (!inputText.value) {
			return;
		}
		socket.joinGame(inputText.value)
		.then(() => {
			// TODO: after user joined the server change to waiting for other users screen (Create it!).
			// when all users joined then resolveFn();
			resolveFn();
		});
	});

	return joinPromise;
}

function removeJoinScreen() {
	const bodyElement = document.getElementsByTagName("body")[0];
	const joinScreenElement = document.getElementById("join");
	bodyElement.removeChild(joinScreenElement);
}

(function main() {
	document.onreadystatechange = () => {
		init();
	};
})();
