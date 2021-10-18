import { dosemuSprite } from "./node_modules/dosemu/index.js";
import { GridEntity } from "./grid-entity.js";
import { checkCollision } from "./collision.js";
import { layers } from "./layers.js";

export class Fire extends GridEntity {

	animationFrame = 0;
	animationDirection = 1;
	sprites = null;

	/** @param {"center"|"middleV"|"middleH"|"capRight"|"capLeft"|"capUp"|"capDown"} type */
	constructor(type, row, column) {
		super(row, column);
		this.type = type;
		this.isSolid = false; // don't prevent other entities from going over fire
		this.setLayer(layers.Fire); // appear behind bricks
	}

	/** @returns {string} the type of entity */
	getType() { return "fire"; }

	/** @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		const frames = this.getSpriteSequence().frames;
		return frames[Math.floor(this.animationFrame) % frames.length];
	}

	/** @private */
	getSpriteSequence() {
		return this.sprites ? this.sprites[this.type] : null;
	}

	update(dt) {
		this.animationFrame += dt * this.getSpriteSequence().animationSpeed * this.animationDirection;
		if (this.animationFrame >= this.getSpriteSequence().frames.length - 0.5) {
			// reverse the animation
			this.animationDirection = -1;
		}
		if (this.animationFrame < 0) {
			// reached the end of the line
			this.destroy();
		}
		this.checkCollision();
	}

	checkCollision() {
		const collisionResult = checkCollision(this.getBoundingBox(), this);
		if (collisionResult && collisionResult.entity && !collisionResult.entity.isDestroyed) {
			// we hit an entity
			collisionResult.entity.fry();
		}
	}

	/**
	 * @override
	 * @returns {dosemuSprite.Sprite}
	 */
	 get3DSprite() {
		const frames = fireSprites["middleH"].frames;
		return frames[Math.floor(this.animationFrame) % frames.length];
	}
}
