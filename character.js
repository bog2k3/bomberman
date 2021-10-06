import { dosemu } from "./node_modules/dosemu/index.js";

export class Character {
	x = 0;
	y = 0;
	speed = 0;

	/** @private */
	orientation = "down";
	/** @private */
	isStopped = true;

	/** @param {Character} data */
	constructor(data) {
		if (data) {
			Object.assign(this, data);
		}
	}

	update(dt) {
		if (!this.isStopped) {
			// play animation
			const delta = this.speed * dt;
			switch (this.orientation) {
				case "up": this.y -= delta; break;
				case "down": this.y += delta; break;
				case "left": this.x -= delta; break;
				case "right": this.x += delta; break;
			}
		}
		this.isStopped = true;
	}

	move(direction) {
		this.isStopped = false;
		this.orientation = direction;
	}
}
