import { GridEntity } from "./grid-entity.js";
import { layers } from "./layers.js";
import powerupBombSprite from "./sprites/powerups/powerup-bomb.png.js";

export class PowerupBomb extends GridEntity {

	constructor(row, col) {
		super(row, col);
		this.setLayer(layers.Powerup);
		this.isSolid = false;
	}

	/** @override @returns {string} the type of entity */
	getType() { return "powerup-bomb"; }

	/** @override @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		return powerupBombSprite;
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
		return powerupBombSprite;
	}
}
