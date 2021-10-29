import { dosemuBBox } from "./node_modules/dosemu/index.js";
import { checkCollision, CollisionResult } from "./collision.js";
import { Entity } from "./entity.js";
import { layers } from "./layers.js";
import * as constants from "./constants.js";
import * as world from "./world.js";
import { EntityState } from "./entity-state.js";
import { Bomb } from "./bomb.js";

export class Character extends Entity {
	x = 0;
	y = 0;
	baseSpeed = 0;
	speed = 0;

	/** @type {"up" | "down" | "left" | "right"} */
	orientation = "down";
	/** @private */
	isStopped = true;

	/** @type {dosemuBBox.BoundingBox} */
	boundingBox = {up: -10, down: 2, left: -6, right: 6};

	/** @type {Bomb[]} */
	overlapingBombs = [];

	/** @param {Character} data */
	constructor(data) {
		super();
		if (data) {
			Object.assign(this, data);
		}
		this.setLayer(layers.Character);
		this.speed = this.baseSpeed;
	}

	/** @override @returns {CharacterState} */
	buildStateData() {
		return {
			...super.buildStateData(),
			x: this.x,
			y: this.y,
			speed: this.speed,
			orientation: this.orientation,
			overlapingBombIds: this.overlapingBombs.map(bomb => bomb.uuid)
		};
	}

	/** @override @returns full data required to rebuild this object */
	serialize() {
		return {
			...super.serialize(),
			x: this.x,
			y: this.y,
			baseSpeed: this.baseSpeed,
			speed: this.speed,
			orientation: this.orientation,
			overlapingBombIds: this.overlapingBombs.map(bomb => bomb.uuid)
		}
	}

	/** @override */
	deserialize(data) {
		super.deserialize(data);
		this.x = data.x;
		this.y = data.y;
		this.speed = data.speed;
		this.baseSpeed = data.baseSpeed;
		this.orientation = data.orientation;
		this.overlapingBombs = world.getEntities().filter(
			e => data.overlapingBombIds.includes(e.uuid)
		);
	}

	/** @override @param {CharacterState} data */
	updateFromStateData(data) {
		this.x = data.x;
		this.y = data.y;
		this.speed = data.speed;
		this.orientation = data.orientation;
		this.overlapingBombs = world.getEntities().filter(
			e => data.overlapingBombIds.includes(e.uuid)
		);
		super.updateFromStateData(data);
	}

	/** @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() {
		return dosemuBBox.moveBoundingBox(this.boundingBox, this.x, this.y);
	}

	/** @returns {number} the row the character is on */
	getRow() {
		return Math.floor(this.y / constants.TILE_SIZE);
	}

	/** @returns {number} the column the character is on */
	getColumn() {
		return Math.floor(this.x / constants.TILE_SIZE);
	}

	/**
	 * Override this to decide if certain collisions should be ignored;
	 * Don't forget to call super.ignoreCollision(collision) and return true if it returns true
	 * @virtual
	 * @param {CollisionResult} collision
	 * @returns {boolean}
	 */
	ignoreCollision(collision) {
		if (collision.entity && this.overlapingBombs.includes(collision.entity)) {
			// We ignore collision with a bomb if it just got spawned underneath us, until we walk away from it
			return true;
		}
		return false;
	}

	/** @override @virtual */
	update(dt) {
		const speedFactor = Math.sqrt(this.speed / this.baseSpeed);
		super.update(dt * speedFactor); // animation should be updated faster when speed is higher
		if (!this.isStopped) {
			// update position
			const delta = this.speed * dt;
			const prevX = this.x, prevY = this.y;
			const collisionResultBefore = checkCollision(dosemuBBox.moveBoundingBox(this.boundingBox, this.x, this.y), this);
			switch (this.orientation) {
				case "up": this.y -= delta; break;
				case "down": this.y += delta; break;
				case "left": this.x -= delta; break;
				case "right": this.x += delta; break;
			}
			const collisionResultAfter = checkCollision(dosemuBBox.moveBoundingBox(this.boundingBox, this.x, this.y), this);
			const deltaOverlap = (collisionResultAfter?.totalOverlap || 0) -
				(collisionResultBefore?.entity === collisionResultAfter?.entity ? collisionResultBefore?.totalOverlap || 0 : 0);
			if (collisionResultAfter) {
				if (!this.ignoreCollision(collisionResultAfter) &&
					(!collisionResultAfter.entity || collisionResultAfter.entity.isSolid) && deltaOverlap > 0
				) {
					this.x = prevX;
					this.y = prevY;
					this.isStopped = true;
				}
				this.reactToCollision(collisionResultAfter, deltaOverlap, dt);
			}
			for (let i=0; i<this.overlapingBombs.length;) {
				if (!dosemuBBox.getBoundingBoxOverlap(this.getBoundingBox(), this.overlapingBombs[i].getBoundingBox())) {
					// we're not overlapping the bomb any more
					this.overlapingBombs.splice(i, 1);
				} else {
					i++;
				}
			}
		}
		this.isStopped = true;
	}

	/** @param {"up" | "down" | "left" | "right"} direction */
	move(direction) {
		if (!["up", "down", "left", "right"].includes(direction)) {
			return;
		}
		this.orientation = direction;
		this.startAnimation(this.orientation);
		this.isStopped = false;
	}

	/** @override we've been fried by an explosion */
	fry(killerSlotId) {
		this.die();
	}

	die() {
		this.destroy();
	}
}

export class CharacterState extends EntityState {
	/** @type {number} */
	x;
	/** @type {number} */
	y;
	/** @type {number} */
	speed;
	/** @type {"up"|"down"|"left"|"right"} */
	orientation;
	/** @type {string[]} */
	overlapingBombIds;
}
