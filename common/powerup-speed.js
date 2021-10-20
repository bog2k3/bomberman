import { GridEntity } from "./grid-entity.js";
import { layers } from "./layers.js";

export class PowerupSpeed extends GridEntity {

	constructor(row, col) {
		super(row, col);
		this.setLayer(layers.Powerup);
		this.isSolid = false;
	}

	/** @override @returns {string} the type of entity */
	getType() { return "powerup-speed"; }

	/** @override */
	fry() {
		this.destroy();
	}
}
