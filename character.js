import { checkCollision, CollisionResult } from "./collision.js";
import { Entity } from "./entity.js";
import { dosemu, dosemuBBox, dosemuSprite } from "./node_modules/dosemu/index.js";
import { SpriteSequence } from "./sprite-sequence.js";
import * as constants from "./constants.js";
import { CharacterExplodeAnimation } from "./character-explode-animation.js";

export class Character extends Entity {
	x = 0;
	y = 0;
	speed = 0;

	/** @private */
	animationFrame = 0;

	/** @type {"up" | "down" | "left" | "right"} */
	orientation = "down";
	/** @private */
	isStopped = true;
	/** @type {{left: SpriteSequence, right: SpriteSequence, up: SpriteSequence, down: SpriteSequence, explode: SpriteSequence}} */
	spriteSet = {};

	/** @type {dosemuBBox.BoundingBox} */
	boundingBox = {up: -10, down: 3, left: -6, right: 6};

	/** @param {Character} data */
	constructor(data) {
		super();
		if (data) {
			Object.assign(this, data);
		}
		this.setLayer(1);
	}

	/** @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() {
		return dosemuBBox.moveBoundingBox(this.boundingBox, this.x, this.y);
	}

	/** @returns {dosemuSprite.Sprite} */
	getCurrentSprite() {
		return this.spriteSet[this.orientation].frames[Math.floor(this.animationFrame) % this.spriteSet[this.orientation].frames.length];
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
	 * @param {number} mapOffsX the position of the map, relative to the screen, in pixels
	 * @param {number} mapOffsY the position of the map, relative to the screen, in pixels
	 **/
	draw(mapOffsX, mapOffsY) {
		dosemu.drawSprite(this.x + mapOffsX, this.y + mapOffsY, this.getCurrentSprite());
	}

	/** @virtual override this to take action when hitting a brick */
	handleCollisionWithBrick(row, column, type) {
		return;
	}

	/**
	 * Override this to decide if certain collisions should be ignored
	 * @virtual
	 * @param {CollisionResult} collision
	 * @returns {boolean}
	 */
	ignoreCollision(collision) {
		return false;
	}

	update(dt) {
		if (!this.isStopped) {
			// update animation
			this.animationFrame += dt * this.spriteSet[this.orientation].animationSpeed;
			// update position
			const delta = this.speed * dt;
			const prevX = this.x, prevY = this.y;
			switch (this.orientation) {
				case "up": this.y -= delta; break;
				case "down": this.y += delta; break;
				case "left": this.x -= delta; break;
				case "right": this.x += delta; break;
			}
			const collisionResult = checkCollision(dosemuBBox.moveBoundingBox(this.boundingBox, this.x, this.y), this);
			if (collisionResult && !this.ignoreCollision(collisionResult)) {
				this.x = prevX;
				this.y = prevY;
				this.isStopped = true;
				if (collisionResult.brick) {
					this.handleCollisionWithBrick(collisionResult.brick.row, collisionResult.brick.column, collisionResult.brick.type);
				}
			}
		}
		if (this.isStopped) {
			this.animationFrame = 0.9; // reset to the first frame, but right before switching to the second, so when player presses a key, the animation starts right away
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

	/** we've been fried by an explosion */
	fry() {
		// create a dummy explode animation entity
		new CharacterExplodeAnimation(this.spriteSet.explode, this.x, this.y);
		this.destroy();
	}
}
