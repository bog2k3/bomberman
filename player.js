import { dosemu, dosemuBBox } from "./node_modules/dosemu/index.js";
import { Character } from "./character.js";
import * as world from "./world.js";
import { Bomb } from "./bomb.js";
import { CollisionResult } from "./collision.js";

export class Player extends Character {

	wasSpacePressed = false;
	/** @type {Bomb[]} */
	overlapingOwnBombs = [];

	bombPower = 1;

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
		for (let i=0; i<this.overlapingOwnBombs.length;) {
			if (!dosemuBBox.getBoundingBoxOverlap(this.getBoundingBox(), this.overlapingOwnBombs[i].getBoundingBox())) {
				// we're not overlapping the bomb any more
				this.overlapingOwnBombs.splice(i, 1);
			} else {
				i++;
			}
		}
	}

	/**
	 * We ignore collision with a bomb if we just spawned it and haven't moved away from it yet
	 * @virtual
	 * @param {CollisionResult} collision
	 * @returns {boolean}
	 */
	ignoreCollision(collision) {
		if (collision.entity && this.overlapingOwnBombs.includes(collision.entity)) {
			return true;
		}
		return false;
	}

	spawnBomb() {
		const spawnRow = this.getRow();
		const spawnColumn = this.getColumn();
		if (!world.isBombAt(spawnRow, spawnColumn)) {
			this.overlapingOwnBombs.push(new Bomb(this.bombPower, spawnRow, spawnColumn));
		}
	}
}
