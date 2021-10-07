import { dosemu } from "./node_modules/dosemu/index.js";
import { Character } from "./character.js";
import * as collision from "./collision.js";
import { Bomb } from "./bomb.js";

export class Player extends Character {

	wasSpacePressed = false;

	/** @param {Character} data */
	constructor(data) {
		super(data);
	}

	/** @returns {string} the type of entity */
	getType() { return "player"; }

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
		if (!collision.isBombAt(spawnRow, spawnColumn)) {
			new Bomb(5, spawnRow, spawnColumn);
		}
	}
}
