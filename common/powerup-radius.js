import { GridEntity } from "./grid-entity.js";
import { layers } from "./layers.js";

export class PowerupRadius extends GridEntity {

	constructor(row, col) {
		super(row, col);
		this.setLayer(layers.Powerup);
		this.isSolid = false;
	}

	/** @override @returns {string} the type of entity */
	getType() { return "powerup-radius"; }

	/** @override */
	fry() {
		this.destroy();
	}
}
