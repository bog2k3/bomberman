import { AnimationController } from "./animation-controller.js";
import { dosemuBBox } from "./node_modules/dosemu/index.js";

/** @abstract */
export class Entity {

	layer = 0;
	isSolid = true;
	isDestroyed = false;
	animationController = new AnimationController();

	/** @type {(this: Entity) => void} callback to be invoked when the entity is destroyed. */
	onDestroy = null;

	constructor() {
		if (Entity.onEntityCreated) {
			Entity.onEntityCreated(this);
		}
	}

	destroy() {
		if (!this.isDestroyed) {
			this.isDestroyed = true;
			if (this.onDestroy) {
				this.onDestroy(this);
			}
			if (Entity.onEntityDestroyed) {
				Entity.onEntityDestroyed(this);
			}
		}
	}

	/** @abstract @returns {string} the type of entity */
	getType() { throw "you must override abstract method."; }

	/** @abstract @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() { throw "you must override abstract method."; }

	/** @virtual override this to implement update; you must call super.update(dt) */
	update(dt) {
		this.animationController.update(dt);
	}

	/**
	 * Sets the layer in which this entity resides. The layering affects the draw order.
	 * The base layer (containing the bricks) is zero. Positive layers appear on top, and negative layers below.
	 * @param {number} layerNumber
	 */
	setLayer(layerNumber) {
		this.layer = layerNumber;
	}

	/** @virtual Override this to react to being fried by an explosion */
	fry() {}

	/**
	 * @type {(entity: Entity) => void}
	 * This event is triggered every time a new entity is created
	 **/
	static onEntityCreated = null;

	/**
	 * @type {(entity: Entity) => void}
	 * This event is triggered every time a new entity is destroyed
	 **/
	 static onEntityDestroyed = null;
}
