import { dosemuSprite } from "./node_modules/dosemu/index.js";
import { GridEntity } from "./grid-entity.js";
import { layers } from "./layers.js";

export class PowerupRadius extends GridEntity {

	/** @type {dosemuSprite.Sprite} */
	sprite = null;

	/** @param {dosemuSprite.Sprite} sprite */
	constructor(row, col, sprite) {
		super(row, col);
		this.setLayer(layers.Powerup);
		this.isSolid = false;
		this.sprite = sprite;
	}

	/** @override @returns {string} the type of entity */
	getType() { return "powerup-radius"; }

	/** @override @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		return this.sprite;
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
		return this.sprite;
	}
}
