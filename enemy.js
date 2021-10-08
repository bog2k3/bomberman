import { Character } from "./character.js";

export class Enemy extends Character {
	type = 0;
	/** @param {Character & {type: number}} data */
	constructor(data) {
		super(data);
		this.type = data.type || 0;
	}

	/** @override @returns {string} the type of entity */
	getType() { return `enemy-${this.type}`; }

	/** @override */
	update(dt) {
		super.update(dt);
		this.move("up");
	}
}
