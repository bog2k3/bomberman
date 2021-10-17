import { dosemu, dosemuSound } from "./node_modules/dosemu/index.js";
import * as bomberman from "./bomberman.js";

let lastTime = new Date().getTime();

function init() {
	join().then(() => {
		removeJoinScreen();
		dosemu.init(document.querySelector("#emuscreen"), null);
		// dosemu.setNoiseStrength(0);
		requestAnimationFrame(step);
		dosemu.hideMouse();
		bomberman.init();
	})
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
		resolveFn();
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
