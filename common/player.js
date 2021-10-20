import { dosemu } from "./node_modules/dosemu/index.js";
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

	/** @param {Entity} entity */
	reactToCollisionWithEntity(entity) {
		switch (entity.getType()) {
			case "powerup-bomb":
				this.maxBombCount++;
				entity.destroy();
				break;
			case "powerup-radius":
				this.bombPower++;
				entity.destroy();
				break;
			case "powerup-speed":
				this.speed += constants.PLAYER_SPEED_INCREMENT;
				entity.destroy();
				break;
		}
	}

	/** @param {CollisionResult} collision */
	reactToCollisionWithBrick(collision, dt) {
		// if player tries to go between two bricks but is not quite aligned, we help him a bit
		const adjustFactor = 0.5 * this.speed * dt;
		const tileSize = constants.TILE_SIZE;
		const tolerance = tileSize / 3;

		let drow = 0, dcol = 0;
		const bbox = this.getBoundingBox();
		const bboxCenterX = (bbox.left + bbox.right) / 2;
		const bboxCenterY = (bbox.up + bbox.down) / 2;
		const xRel = bboxCenterX - (collision.brick.column + 0.5) * tileSize;
		const yRel = bboxCenterY - (collision.brick.row + 0.5) * tileSize;
		const xOverlap = xRel > 0 ? (bbox.left % tileSize - tileSize) : (bbox.right % tileSize);
		const yOverlap = yRel > 0 ? (bbox.up % tileSize - tileSize) : (bbox.down % tileSize);
		switch (this.orientation) {
			case "left":
			case "right":
				if (Math.abs(yOverlap) < tolerance) {
					drow = -Math.sign(yOverlap);
				}
				break;
			case "up":
			case "down":
				if (Math.abs(xOverlap) < tolerance) {
					dcol = -Math.sign(xOverlap);
				}
				break;
		}
		if (world.getMapCell(collision.brick.row + drow, collision.brick.column + dcol) == 0) {
			this.x += dcol * adjustFactor;
			this.y += drow * adjustFactor;
		}
	}

	/**
	 * @override
	 * @param {CollisionResult} collision
	 * @param {number} deltaOverlap the difference in overlap between this frame and the previous one
	 * @param {number} dt time delta since last frame
	 * (if positive, the collision is "bigger" than last time, if negative it is "smaller")
	 * */
	reactToCollision(collision, deltaOverlap, dt) {
		if (collision.entity) {
			return this.reactToCollisionWithEntity(collision.entity);
		} else {
			return this.reactToCollisionWithBrick(collision, dt);
		}
	}
}
