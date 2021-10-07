import { dosemuBBox } from "./node_modules/dosemu/index.js";

export class Entity {

	layer = 0;

	constructor() {
		if (Entity.onEntityCreated) {
			Entity.onEntityCreated(this);
		}
	}

	destroy() {
		if (Entity.onEntityDestroyed) {
			Entity.onEntityDestroyed(this);
		}
	}

	/** @returns {string} the type of entity */
	getType() { throw "you must override abstract method."; }

	/** @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() { throw "you must override abstract method."; }

	/**
	 * @param {number} mapOffsX the position of the map, relative to the screen, in pixels
	 * @param {number} mapOffsY the position of the map, relative to the screen, in pixels
	 **/
	draw(mapOffsX, mapOffsY) { throw "you must override abstract method."; }

	/**
	 * Sets the layer in which this entity resides. The layering affects the draw order.
	 * The base layer (containing the bricks) is zero. Positive layers appear on top, and negative layers below.
	 * @param {number} layerNumber
	 */
	setLayer(layerNumber) {
		this.layer = layerNumber;
	}

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
