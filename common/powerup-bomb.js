import { GridEntity } from "./grid-entity.js";
import { layers } from "./layers.js";

export class PowerupBomb extends GridEntity {

	static ENTITY_TYPE = "powerup-bomb";

	constructor(row, col) {
		super(row, col);
		this.setLayer(layers.Powerup);
		this.isSolid = false;
	}

	/** @override @returns {string} the type of entity */
	getType() { return PowerupBomb.ENTITY_TYPE; }

	/** @override */
	fry(killerSlotId) {
		this.destroy();
	}
}
