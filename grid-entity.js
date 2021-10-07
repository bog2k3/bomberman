import { dosemuSprite } from "./node_modules/dosemu/index.js";
import * as constants from "./constants.js";
import { dosemu, dosemuBBox } from "./node_modules/dosemu/index.js";
import { Entity } from "./entity.js";

export class GridEntity extends Entity {
	row = 0;
	column = 0;

	constructor(row, column) {
		super();
		this.row = row;
		this.column = column;
	}

	/** @abstract @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() { throw "you must override abstract method."; }

	/** @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() {
		return dosemuBBox.moveBoundingBox(
			{up: 0, down: 15, left: 0, right: 15},
			this.column * constants.TILE_SIZE,
			this.row * constants.TILE_SIZE
		);
	}

	/**
	 * @param {number} mapOffsX the position of the map, relative to the screen, in pixels
	 * @param {number} mapOffsY the position of the map, relative to the screen, in pixels
	 **/
	 draw(mapOffsX, mapOffsY) {
		dosemu.drawSprite(
			mapOffsX + (this.column + 0.5) * constants.TILE_SIZE,
			mapOffsY + (this.row + 0.5) * constants.TILE_SIZE,
			this.getCurrentSprite()
		);
	}
}
