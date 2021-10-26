import { InputSource } from "./input-source.js";
import { Player } from "./player.js";
import { Bomb } from "./bomb.js";

export class InputController {

	/** @type {InputSource} */
	inputSource = null;
	wasSpacePressed = false;

	/** @param {InputSource} inputSource */
	constructor(inputSource) {
		this.inputSource = inputSource;
	}

	/** @param {Player} player */
	update(player) {
		if (this.inputSource.isKeyPressed("ArrowDown")) {
			player.move("down");
		} else if (this.inputSource.isKeyPressed("ArrowUp")) {
			player.move("up");
		} else if (this.inputSource.isKeyPressed("ArrowLeft")) {
			player.move("left");
		} else if (this.inputSource.isKeyPressed("ArrowRight")) {
			player.move("right");
		}
		if (this.inputSource.isKeyPressed(" ") && !this.wasSpacePressed) {
			this.trySpawnBomb(player);
			this.wasSpacePressed = true;
		}
		if (!this.inputSource.isKeyPressed(" ")) {
			this.wasSpacePressed = false;
		}
	}

	/** @param {Player} player */
	trySpawnBomb(player) {
		if (!player.canSpawnBomb()) {
			return;
		}
		const spawnRow = player.getRow();
		const spawnColumn = player.getColumn();
		player.bombCount++;
		(new Bomb(player.bombPower, spawnRow, spawnColumn))
			.onDestroy = () => player.bombCount--;
	}
}
