import { dosemuSprite } from "./node_modules/dosemu/index.js";
import { GridEntity } from "./grid-entity";

export class Fire extends GridEntity {

	constructor() {
		super();
	}

	/** @returns {string} the type of entity */
	getType() { return "fire"; }

	/** @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		return new Sprite();
	}
}
