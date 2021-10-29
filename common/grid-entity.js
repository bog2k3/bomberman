import { dosemuBBox } from "./node_modules/dosemu/index.js";
import * as constants from "./constants.js";
import { Entity } from "./entity.js";

/** @abstract */
export class GridEntity extends Entity {
	row = 0;
	column = 0;

	constructor(row, column) {
		super();
		this.row = row;
		this.column = column;
	}

	/** @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() {
		return dosemuBBox.moveBoundingBox(
			{up: 0, down: 15, left: 0, right: 15},
			this.column * constants.TILE_SIZE,
			this.row * constants.TILE_SIZE
		);
	}

	/** @override @returns full data required to rebuild this object */
	serialize() {
		return {
			...super.serialize(),
			row: this.row,
			column: this.column
		};
	}

	/** @override */
	deserialize(data) {
		super.deserialize(data);
		this.row = data.row;
		this.column = data.column;
	}
}
