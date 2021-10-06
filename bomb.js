import { bombSprites } from "./bomb-sprites.js";
import { Entity } from "./entity.js";
import { dosemu, dosemuBBox } from "./node_modules/dosemu/index.js";
import * as constants from "./constants.js";

export class Bomb extends Entity {

	animationFrame = 0;
	fuseTime = constants.BOMB_FUSE_TIME;
	power = 1;
	row = 0;
	column = 0;

	/** @param {number} power the number of tiles the flames will span in each direction */
	constructor(power, row, column) {
		super();
		this.power = power;
		this.row = row;
		this.column = column;
	}

	/** @returns {string} the type of entity */
	getType() { return "bomb"; }

	/** @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() {
		return dosemuBBox.moveBoundingBox(
			{up: -8, down: 8, left: -8, right: 8},
			this.column * constants.TILE_SIZE,
			this.row * constants.TILE_SIZE
		);
	}

	update(dt) {
		this.animationFrame += bombSprites.animationSpeed * dt;
		this.fuseTime -= dt;
		if (this.fuseTime <= 0) {
			this.explode();
		}
	}

	/**
	 * @param {number} mapOffsX the position of the map, relative to the screen, in pixels
	 * @param {number} mapOffsY the position of the map, relative to the screen, in pixels
	 **/
	draw(mapOffsX, mapOffsY) {
		dosemu.drawSprite(
			mapOffsX + (this.column + 0.5) * constants.TILE_SIZE,
			mapOffsY + (this.row + 0.5) * constants.TILE_SIZE,
			bombSprites.frames[Math.floor(this.animationFrame) % bombSprites.frames.length]
		);
	}

	explode() {
		// TODO create flames
		this.destroy();
	}
}
