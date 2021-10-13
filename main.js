import { dosemu, dosemuSound } from "./node_modules/dosemu/index.js";
import * as bomberman from "./bomberman.js";

let lastTime = new Date().getTime();

function init() {
	//dosemu.setNoiseStrength(0);
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

(function main() {
	document.onreadystatechange = () => {
		dosemu.init(document.querySelector("#emuscreen"), null);
		init();
	};
})();
