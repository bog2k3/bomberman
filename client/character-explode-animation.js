import { dosemuBBox } from "./node_modules/dosemu/index.js";
import { Entity } from "../common/entity.js";
import { layers } from "../common/layers.js";

export class CharacterExplodeAnimation extends Entity {

	/** @type {dosemuBBox.BoundingBox} */
	boundingBox = {up: 5, down: 17, left: 5, right: 17};

	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
		this.setLayer(layers.CharacterExplodeAnimation);
		this.animationController.onAnimationFinished = () => this.handleAnimationFinished();
	}

	getType() {
		return "character-explode-animation";
	}

	getBoundingBox() {
		return dosemuBBox.moveBoundingBox(this.boundingBox, this.x, this.y);
	}

	handleAnimationFinished() {
		this.destroy();
	}
}
