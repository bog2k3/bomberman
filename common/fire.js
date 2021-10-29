import { GridEntity } from "./grid-entity.js";
import { checkCollision } from "./collision.js";
import { layers } from "./layers.js";
import * as constants from "./constants.js";

export class Fire extends GridEntity {

	static ENTITY_TYPE = "fire";

	type = "";

	/** @param {"center"|"middleV"|"middleH"|"capRight"|"capLeft"|"capUp"|"capDown"} type */
	constructor(type, row, column) {
		super(row, column);
		this.type = type;
		this.isSolid = false; // don't prevent other entities from going over fire
		this.setLayer(layers.Fire); // appear behind bricks
	}

	/** @returns {string} the type of entity */
	getType() { return Fire.ENTITY_TYPE; }

	/** @override @returns full data required to rebuild this object */
	serialize() {
		return {
			...super.serialize(),
			type: this.type
		};
	}

	/** @override */
	deserialize(data) {
		super.deserialize(data);
		this.type = data.type;
	}

	update(dt) {
		super.update(dt);
		if (this.lifetime > constants.FIRE_DURATION) {
			this.destroy();
			return;
		}
		if (this.lifetime >= constants.FIRE_DURATION / 2) {
			this.animationController.animationProgress = (1 - (this.lifetime - constants.FIRE_DURATION / 2) / (constants.FIRE_DURATION / 2)) * this.animationController.animationDuration;
		} else {
			this.animationController.animationProgress = this.lifetime / (constants.FIRE_DURATION / 2) * this.animationController.animationDuration;
		}
		this.checkCollision();
	}

	checkCollision() {
		const collisionResult = checkCollision(this.getBoundingBox(), this);
		if (collisionResult && collisionResult.entity && !collisionResult.entity.isDestroyed) {
			// we hit an entity
			collisionResult.entity.fry();
		}
	}
}
