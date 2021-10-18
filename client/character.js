import { checkCollision, CollisionResult } from "./collision.js";
import { Entity } from "./entity.js";
import { dosemu, dosemuBBox, dosemuSprite } from "./node_modules/dosemu/index.js";
import { SpriteSequence } from "./sprite-sequence.js";
import * as constants from "./constants.js";
import { CharacterExplodeAnimation } from "./character-explode-animation.js";
import { layers } from "../common/layers.js";

export class Character extends Entity {
	x = 0;
	y = 0;
	baseSpeed = 0;
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

	/** @returns {dosemuSprite.Sprite} */
	getCurrentSprite() {
		if (!this.spriteSet[this.orientation]) {
			console.error(`Missing spriteSet for orientation="${this.orientation}" in Character `, this);
		}
		const currentFrame = Math.floor(this.animationFrame) % this.spriteSet[this.orientation].frames.length;
		if (!this.spriteSet[this.orientation].frames || !this.spriteSet[this.orientation].frames[currentFrame]) {
			console.error(`Missing animation frame ${currentFrame} in spriteSet for orientation="${this.orientation}" in Character `, this);
		}
		return this.spriteSet[this.orientation].frames[currentFrame];
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

	/**
	 * @virtual override this to take action when colliding with a brick/entity
	 * @param {CollisionResult} collision
	 * @param {number} deltaOverlap the difference in overlap between this frame and the previous one
	 * @param {number} dt time delta since last frame
	 * (if positive, the collision is "bigger" than last time, if negative it is "smaller")
	 * */
	reactToCollision(collision, deltaOverlap, dt) {
		return;
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
		if (!this.isStopped) {
			// update animation
			const speedFactor = Math.sqrt(this.speed / this.baseSpeed);
			this.animationFrame += dt * speedFactor * this.spriteSet[this.orientation].animationSpeed;
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

	/**
	 * @override
	 * @returns {dosemuSprite.Sprite}
	 */
	 get3DSprite() {
		const currentFrame = Math.floor(this.animationFrame) % this.spriteSet[this.orientation].frames.length;
		return this.spriteSet.down.frames[currentFrame];
	 }
}
