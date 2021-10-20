import { dosemuBBox } from "../common/node_modules/dosemu/index.js";
import { Entity } from "../common/entity.js";
import { layers } from "../common/layers.js";

export class CharacterExplodeAnimation extends Entity {

	type = "";
	/** @type {dosemuBBox.BoundingBox} */
	boundingBox = {up: 5, down: 17, left: 5, right: 17};

	/** @param {"player-n" | "enemy-n"} type the type of animation to create, where "n" is the skin number */
	constructor(x, y, type) {
		super();
		this.x = x;
		this.y = y;
		this.type = type;
		this.setLayer(layers.CharacterExplodeAnimation);
		this.animationController.onAnimationFinished = () => this.handleAnimationFinished();
		this.startAnimation("explode");
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
