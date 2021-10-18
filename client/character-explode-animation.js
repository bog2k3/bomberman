import { dosemu, dosemuBBox } from "./node_modules/dosemu/index.js";
import { Entity } from "./entity.js";
import { SpriteSequence } from "./sprite-sequence.js";
import { layers } from "./layers.js";

export class CharacterExplodeAnimation extends Entity {
	/** @private */
	animationFrame = 0;

	/** @type {SpriteSequence} */
	spriteSet = {};

	/** @type {dosemuBBox.BoundingBox} */
	boundingBox = {up: 5, down: 17, left: 5, right: 17};

	constructor(spriteSet, x, y) {
		super();
		this.spriteSet = spriteSet;
		this.x = x;
		this.y = y;
		this.setLayer(layers.CharacterExplodeAnimation);
	}

	getType() {
		return "character-explode-animation";
	}

	getBoundingBox() {
		return dosemuBBox.moveBoundingBox(this.boundingBox, this.x, this.y);
	}

	update(dt) {
		// update animation
		this.animationFrame += dt * this.spriteSet.animationSpeed;
		if (this.animationFrame >= this.spriteSet.frames.length) {
			this.destroy();
		}
	}

	/**
	 * @param {number} mapOffsX the position of the map, relative to the screen, in pixels
	 * @param {number} mapOffsY the position of the map, relative to the screen, in pixels
	 **/
	draw(mapOffsX, mapOffsY) {
		dosemu.drawSprite(this.x + mapOffsX, this.y + mapOffsY, this.getCurrentSprite());
	}

	/** @returns {dosemuSprite.Sprite} */
	getCurrentSprite() {
		return this.spriteSet.frames[Math.floor(this.animationFrame) % this.spriteSet.frames.length];
	}

	/**
	 * @override
	 * @returns {dosemuSprite.Sprite}
	 */
	 get3DSprite() {
		return this.getCurrentSprite();
	}
}
