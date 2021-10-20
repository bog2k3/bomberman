import { checkCollision, CollisionResult } from "./collision.js";
import { Entity } from "./entity.js";
import { dosemu, dosemuBBox, dosemuSprite } from "../client/node_modules/dosemu/index.js";
import { SpriteSequence } from "../client/sprite-sequence.js";
import * as constants from "./constants.js";
import { CharacterExplodeAnimation } from "../client/character-explode-animation.js";
import { layers } from "./layers.js";

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
		if (this.isStopped) {
			// reset to the first frame, but right before switching to the second,
			// so when player presses a key, the animation starts right away
			this.animationFrame = 0.9;
			throw ("find another method");
		}
		this.isStopped = true;
	}

	/** @param {"up" | "down" | "left" | "right"} direction */
	move(direction) {
		if (!["up", "down", "left", "right"].includes(direction)) {
			return;
		}
		this.isStopped = false;
		this.orientation = direction;
	}

	/** @override we've been fried by an explosion */
	fry() {
		this.die();
	}

	die() {
		// create a dummy explode animation entity
		new CharacterExplodeAnimation(this.spriteSet.explode, this.x, this.y);
		this.destroy();
	}
}
