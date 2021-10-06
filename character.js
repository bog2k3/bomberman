import { dosemuSprite } from "./node_modules/dosemu/index.js";
import { SpriteSequence } from "./sprite-sequence.js";

export class Character {
	x = 0;
	y = 0;
	speed = 0;
	animationFrame = 0;

	/** @type {"up" | "down" | "left" | "right"} */
	orientation = "down";
	/** @private */
	isStopped = true;
	/** @private @type {{left: SpriteSequence, right: SpriteSequence, up: SpriteSequence, down: SpriteSequence}} */
	spriteSet = {};

	/** @param {Character} data */
	constructor(data) {
		if (data) {
			Object.assign(this, data);
		}
	}

	/** @param {{left: SpriteSequence, right: SpriteSequence, up: SpriteSequence, down: SpriteSequence}} spriteSet */
	setSpriteSet(spriteSet) {
		this.spriteSet = spriteSet;
	}

	/** @returns {dosemuSprite.Sprite} */
	getCurrentSprite() {
		return this.spriteSet[this.orientation].frames[Math.floor(this.animationFrame) % this.spriteSet[this.orientation].frames.length];
	}

	update(dt) {
		if (!this.isStopped) {
			// update animation
			this.animationFrame += dt * this.spriteSet[this.orientation].animationSpeed;
			// update position
			const delta = this.speed * dt;
			switch (this.orientation) {
				case "up": this.y -= delta; break;
				case "down": this.y += delta; break;
				case "left": this.x -= delta; break;
				case "right": this.x += delta; break;
			}
		} else {
			this.animationFrame = 0.9;
		}
		this.isStopped = true;
	}

	move(direction) {
		this.isStopped = false;
		this.orientation = direction;
	}
}
