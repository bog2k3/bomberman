import { Character, CharacterState } from "./character.js";
import * as world from "./world.js";
import * as constants from "./constants.js";
import { CollisionResult } from "./collision.js";
import { Entity } from "./entity.js";
import { PowerupSpeed } from "./powerup-speed.js";
import { PowerupRadius } from "./powerup-radius.js";
import { PowerupBomb } from "./powerup-bomb.js";
import { Event } from "./event.js";

export class Player extends Character {

	static ENTITY_TYPE = "player";

	bombPower = 2;
	maxBombCount = 1;
	bombCount = 0;
	skinNumber = 0;
	name = "";

	inputController = null;

	/** @param {(victimSlot: number, killerSlot: number) => void} */
	onFragRegistered = new Event();

	/** @param {Character & {skinNumber: number, name: string}} data */
	constructor(data) {
		super({
			...data,
			baseSpeed: constants.PLAYER_INITIAL_SPEED
		});
		this.speed = this.baseSpeed;
		this.skinNumber = data.skinNumber || 0;
		this.name = data.name || "";
	}

	/** @type {InputController} controller */
	setInputController(controller) {
		this.inputController = controller;
	}

	/** @override @returns {string} the type of entity */
	getType() { return `${Player.ENTITY_TYPE}-${this.skinNumber}`; } // TODO return "player-n" where n is the skin number

	/** @override @returns {PlayerState} */
	buildStateData() {
		return {
			...super.buildStateData(),
			bombPower: this.bombPower,
			maxBombCount: this.maxBombCount,
			bombCount: this.bombCount,
		};
	}

	/** @override @param {PlayerState} data */
	updateFromStateData(data) {
		super.updateFromStateData(data);
		this.bombCount = data.bombCount;
		this.maxBombCount = data.maxBombCount;
		this.bombPower = data.bombPower;
	}

	/** @override @returns full data required to rebuild this object */
	serialize() {
		return {
			...super.serialize(),
			name: this.name,
			skinNumber: this.skinNumber
		};
	}

	update(dt) {
		super.update(dt);
		if (this.inputController) {
			this.inputController.update(this);
		}
	}

	/** @returns {Player} the new player instance */
	respawn(x, y) {
		// create a new player entity that is a copy of this one
		const player = new Player({
			x, y,
			skinNumber: this.skinNumber,
		});
		// if we've respawned on top of a bomb, add it to array so we can walk away from it.
		if (world.isBombAt(this.getRow(), this.getColumn())) {
			this.overlapingBombs.push(
				...world.getEntitiesInCell(this.getRow(), this.getColumn())
					.filter(e => e.getType() == "bomb")
			);
		}
		return player;
	}

	canSpawnBomb() {
		if (this.bombCount >= this.maxBombCount) {
			return false;
		}
		const spawnRow = this.getRow();
		const spawnColumn = this.getColumn();
		if (world.isBombAt(spawnRow, spawnColumn)) {
			return false;
		}
		return true;
	}

	/** @param {Entity} entity */
	reactToCollisionWithEntity(entity) {
		if (entity.getType().startsWith("enemy")) {
			// the enemy ate us
			this.die();
			return;
		}
		switch (entity.getType()) {
			case PowerupBomb.ENTITY_TYPE:
				this.maxBombCount++;
				entity.destroy();
				break;
			case PowerupRadius.ENTITY_TYPE:
				this.bombPower++;
				entity.destroy();
				break;
			case PowerupSpeed.ENTITY_TYPE:
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
		if (![1,2].includes(world.getMapCell(collision.brick.row + drow, collision.brick.column + dcol))) {
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

	/** @override we've been fried by an explosion */
	fry(killerSlotId) {
		super.fry(killerSlotId);
		this.onFragRegistered.trigger(this.skinNumber, killerSlotId);
	}
}

export class PlayerState extends CharacterState {
	/** @type {number} */
	bombPower;
	/** @type {number} */
	maxBombCount;
	/** @type {number} */
	bombCount;
}
