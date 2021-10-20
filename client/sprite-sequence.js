import { dosemuSprite } from "../common/node_modules/dosemu/index.js";

export class SpriteSequence {
	/** @type {dosemuSprite.Sprite[]} */
	frames = [];
	/** @type {number} frames per second */
	animationSpeed = 1.0;
}
