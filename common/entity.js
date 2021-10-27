import { dosemuBBox } from "./node_modules/dosemu/index.js";
import { AnimationController } from "./animation-controller.js";
import { Event } from "./event.js";

/** @abstract */
export class Entity {

	layer = 0;
	isSolid = true;
	isDestroyed = false;
	animationController = new AnimationController();

	/** Event is triggered when the entity is destroyed. */
	onDestroy = new Event();

	/** This event receives the animation name and is triggered every time a new animation is started. */
	onAnimationStart = new Event();

	constructor() {
		Entity.onEntityCreated.trigger(this);
	}

	destroy() {
		if (!this.isDestroyed) {
			this.isDestroyed = true;
			this.onDestroy.trigger();
			Entity.onEntityDestroyed.trigger(this);
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
	 * @param {string} name the name of the animation to start
	 * @param {number} direction +1 to play forward or -1 to play backward
	 **/
	startAnimation(name, direction = +1) {
		this.animationController.animationDirection = Math.sign(direction);
		this.onAnimationStart.trigger(name);
	}

	/**
	 * This event is triggered every time a new entity is created
	 * @type {Event}
	 * @param {Entity} entity
	 **/
	static onEntityCreated = new Event();

	/**
	 * This event is triggered every time a new entity is destroyed
	 * @type {Event}
	 * @param {Entity} entity
	 **/
	 static onEntityDestroyed = new Event();
}
