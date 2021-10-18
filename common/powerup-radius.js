import { GridEntity } from "./grid-entity.js";
import { layers } from "./layers.js";
import powerupRadiusSprite from "./sprites/powerups/powerup-radius.png.js";

export class PowerupRadius extends GridEntity {

	constructor(row, col) {
		super(row, col);
		this.setLayer(layers.Powerup);
		this.isSolid = false;
	}

	/** @override @returns {string} the type of entity */
	getType() { return "powerup-radius"; }

	/** @override @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		return powerupRadiusSprite;
	}

	/** @override */
	fry() {
		this.destroy();
	}

	/**
	 * @virtual
	 * @returns {dosemuSprite.Sprite}
	 */
	 get3DSprite() {
		return powerupRadiusSprite;
	}
}
