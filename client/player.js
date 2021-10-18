import { dosemu, dosemuBBox } from "./node_modules/dosemu/index.js";
import { Character } from "./character.js";
import * as world from "./world.js";
import * as constants from "./constants.js";
import { Bomb } from "./bomb.js";
import { CollisionResult } from "./collision.js";

export class Player extends Character {

	wasSpacePressed = false;
	bombPower = 2;
	maxBombCount = 1;
	bombCount = 0;
	movementInputEnabled = true;

	/** @param {Character} data */
	constructor(data) {
		super({
			...data,
			baseSpeed: constants.PLAYER_INITIAL_SPEED
		});
	}

	/** @override @returns {string} the type of entity */
	getType() { return "player"; }

	/** @override */
	update(dt) {
		super.update(dt);
		if (this.movementInputEnabled) {
			if (dosemu.isKeyPressed("ArrowDown")) {
				this.move("down");
			} else if (dosemu.isKeyPressed("ArrowUp")) {
				this.move("up");
			} else if (dosemu.isKeyPressed("ArrowLeft")) {
				this.move("left");
			} else if (dosemu.isKeyPressed("ArrowRight")) {
				this.move("right");
			}
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
		if (this.bombCount >= this.maxBombCount) {
			return;
		}
		const spawnRow = this.getRow();
		const spawnColumn = this.getColumn();
		if (!world.isBombAt(spawnRow, spawnColumn)) {
			this.bombCount++;
			(new Bomb(this.bombPower, spawnRow, spawnColumn))
				.onDestroy = () => this.bombCount--;
		}
	}

	/**
	 * @override
	 * @param {CollisionResult} collision
	 * @param {number} deltaOverlap the difference in overlap between this frame and the previous one
	 * (if positive, the collision is "bigger" than last time, if negative it is "smaller")
	 * */
	reactToCollision(collision, deltaOverlap) {
		switch (collision.entity?.getType()) {
			case "powerup-bomb":
				this.maxBombCount++;
				collision.entity.destroy();
				break;
			case "powerup-radius":
				this.bombPower++;
				collision.entity.destroy();
				break;
			case "powerup-speed":
				this.speed += constants.PLAYER_SPEED_INCREMENT;
				collision.entity.destroy();
				break;
		}
	}
}
