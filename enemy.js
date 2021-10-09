import { Character } from "./character.js";
import * as world from "./world.js";

export class Enemy extends Character {
	type = 0;
	/** @param {Character & {type: number}} data */
	constructor(data) {
		super({
			...data,
			boundingBox: {up: -7, down: 7, left: -6, right: 6}
		});
		this.type = data.type || 0;
	}

	/** @override @returns {string} the type of entity */
	getType() { return `enemy-${this.type}`; }

	/** @override */
	update(dt) {
		super.update(dt);
		this.move(this.orientation);
	}

	/**
	 * @override
	 * @param {CollisionResult} collision
	 * */
	reactToCollision(collision) {
		const [myRow, myCol] = [this.getRow(), this.getColumn()];
		// determine what are the possible collision-free directions from our current location
		const directions = [];
		if (this.orientation !== "up" && world.getMapCell(myRow - 1, myCol) === 0) {
			directions.push("up");
		}
		if (this.orientation !== "down" && world.getMapCell(myRow + 1, myCol) === 0) {
			directions.push("down");
		}
		if (this.orientation !== "left" && world.getMapCell(myRow, myCol - 1) === 0) {
			directions.push("left");
		}
		if (this.orientation !== "right" && world.getMapCell(myRow, myCol + 1) === 0) {
			directions.push("right");
		}
		if (directions.length) {
			// randomly choose a different direction to move in
			this.orientation = directions[Math.floor(Math.random() * directions.length)];
		} else {
			// switch current orientation to appear like trying
			if (this.orientation === "up") this.move("down");
			if (this.orientation === "down") this.move("up");
			if (this.orientation === "left") this.move("right");
			if (this.orientation === "right") this.move("left");
		}
	}
}
