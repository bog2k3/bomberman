import { GridEntity } from "./grid-entity.js";
import { layers } from "./layers.js";
import powerupSpeedSprite from "./sprites/powerups/powerup-speed.png.js";

export class PowerupSpeed extends GridEntity {

	constructor(row, col) {
		super(row, col);
		this.setLayer(layers.Powerup);
		this.isSolid = false;
	}

	/** @override @returns {string} the type of entity */
	getType() { return "powerup-speed"; }

	/** @override @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		return powerupSpeedSprite;
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
		return powerupSpeedSprite;
	}
}
