import sprite_brick11 from "./sprites/brick11.png.js";
import sprite_brick12 from "./sprites/brick12.png.js";
import sprite_field1 from "./sprites/field1.png.js";
import { Theme } from "./theme.js";

/** @returns {Theme[]} */
export function buildThemes() {
	return[{
		brickSprites: [
			sprite_brick11, sprite_brick12
		],
		fieldSprite: sprite_field1
	}];
}
