import { dosemuSprite } from "./node_modules/dosemu/index.js";
import { bombSprites } from "./bomb-sprites.js";
import * as constants from "./constants.js";
import { GridEntity } from "./grid-entity.js";

export class Bomb extends GridEntity {

	animationFrame = 0;
	fuseTime = constants.BOMB_FUSE_TIME;
	power = 1;

	/** @param {number} power the number of tiles the flames will span in each direction */
	constructor(power, row, column) {
		super(row, column);
		this.power = power;
	}

	/** @returns {string} the type of entity */
	getType() { return "bomb"; }

	/** @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		return bombSprites.frames[Math.floor(this.animationFrame) % bombSprites.frames.length];
	}

	update(dt) {
		this.animationFrame += bombSprites.animationSpeed * dt;
		this.fuseTime -= dt;
		if (this.fuseTime <= 0) {
			this.explode();
		}
	}

	explode() {
		// TODO create flames
		this.destroy();
	}
}
