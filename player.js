import { dosemu } from "./node_modules/dosemu/index.js";
import { Character } from "./character.js";

export class Player extends Character {

	constructor(x, y, speed) {
		super({
			x,
			y,
			speed
		});
	}

	draw(mapOffsX, mapOffsY) {
		dosemu.drawCircle(this.x + mapOffsX, this.y + mapOffsY, 4, 9);
	}

	update(dt) {
		super.update(dt);
		if (dosemu.isKeyPressed("ArrowDown")) {
			this.move("down");
		} else if (dosemu.isKeyPressed("ArrowUp")) {
			this.move("up");
		} else if (dosemu.isKeyPressed("ArrowLeft")) {
			this.move("left");
		} else if (dosemu.isKeyPressed("ArrowRight")) {
			this.move("right");
		}
	}
}
