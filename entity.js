import { dosemuBBox } from "./node_modules/dosemu/index.js";

export class Entity {
	/** @returns {dosemuBBox.BoundingBox} the bounding box of this entity, in world space*/
	getBoundingBox() { throw "you must override abstract method."; }
}
