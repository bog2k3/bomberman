import { GridEntity } from "./grid-entity.js";
import { checkCollision } from "./collision.js";
import { layers } from "./layers.js";
import * as constants from "./constants.js";

export class Fire extends GridEntity {

	animationFrame = 0;
	animationDirection = 1;
	sprites = null;

	/** @param {"center"|"middleV"|"middleH"|"capRight"|"capLeft"|"capUp"|"capDown"} type */
	constructor(type, row, column) {
		super(row, column);
		this.type = type;
		this.isSolid = false; // don't prevent other entities from going over fire
		this.setLayer(layers.Fire); // appear behind bricks
		this.animationController.animationDuration = constants.FIRE_DURATION;
		this.animationController.enableLoop = false;
		this.animationController.onAnimationFinished = () => this.handleAnimationLoop();
	}

	/** @returns {string} the type of entity */
	getType() { return "fire"; }

	update(dt) {
		super.update(dt);
		this.checkCollision();
	}

	handleAnimationFinished() {
		if (this.animationController.animationDirection === -1) {
			this.destroy();
		} else {
			this.animationController.animationDirection = -1;
		}
	}

	checkCollision() {
		const collisionResult = checkCollision(this.getBoundingBox(), this);
		if (collisionResult && collisionResult.entity && !collisionResult.entity.isDestroyed) {
			// we hit an entity
			collisionResult.entity.fry();
		}
	}
}
