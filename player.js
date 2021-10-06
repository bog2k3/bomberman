import { dosemu } from "./node_modules/dosemu/index.js";
import { Character } from "./character.js";
import { SpriteSequence } from "./sprite-sequence.js";

export class Player extends Character {

	/** @param {{left: SpriteSequence, right: SpriteSequence, up: SpriteSequence, down: SpriteSequence}} spriteSet */
	constructor(x, y, speed, spriteSet) {
		super({
			x,
			y,
			speed
		});
		this.setSpriteSet(spriteSet);
	}

	draw(mapOffsX, mapOffsY) {
		dosemu.drawSprite(this.x + mapOffsX, this.y + mapOffsY, this.getCurrentSprite());
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
