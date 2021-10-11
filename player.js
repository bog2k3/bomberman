import { dosemu, dosemuBBox } from "./node_modules/dosemu/index.js";
import { Character } from "./character.js";
import * as world from "./world.js";
import { Bomb } from "./bomb.js";

export class Player extends Character {

	wasSpacePressed = false;
	bombPower = 2;

	/** @param {Character} data */
	constructor(data) {
		super(data);
	}

	/** @override @returns {string} the type of entity */
	getType() { return "player"; }

	/** @override */
	update(dt) {
		super.update(dt);
		if (dosemu.isKeyPressed("ArrowDown")) {
			this.move("down");
		} else if (dosemu.isKeyPressed("ArrowUp")) {
			this.move("up");
		} else if (dosemu.isKeyPressed("ArrowLeft")) {
			this.move("left");
		} else if (dosemu.isKeyPressed("ArrowRight")) {
			this.move("right");
		}
		if (dosemu.isKeyPressed(" ") && !this.wasSpacePressed) {
			this.spawnBomb();
			this.wasSpacePressed = true;
		}
		if (!dosemu.isKeyPressed(" ")) {
			this.wasSpacePressed = false;
		}
	}

	spawnBomb() {
		const spawnRow = this.getRow();
		const spawnColumn = this.getColumn();
		if (!world.isBombAt(spawnRow, spawnColumn)) {
			new Bomb(this.bombPower, spawnRow, spawnColumn);
		}
	}
}
