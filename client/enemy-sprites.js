import enemy1_left1 from "./sprites/enemy1/left1.png.js";
import enemy1_left2 from "./sprites/enemy1/left2.png.js";
import enemy1_left3 from "./sprites/enemy1/left3.png.js";
import enemy1_right1 from "./sprites/enemy1/right1.png.js";
import enemy1_right2 from "./sprites/enemy1/right2.png.js";
import enemy1_right3 from "./sprites/enemy1/right3.png.js";
import enemy1_explode1 from "./sprites/enemy1/explode1.png.js";
import enemy1_explode2 from "./sprites/enemy1/explode2.png.js";
import enemy1_explode3 from "./sprites/enemy1/explode3.png.js";
import enemy1_explode4 from "./sprites/enemy1/explode4.png.js";
import enemy1_explode5 from "./sprites/enemy1/explode5.png.js";
import enemy1_explode6 from "./sprites/enemy1/explode6.png.js";
import { SpriteSequence } from "./sprite-sequence.js";

/** @type {{"up": SpriteSequence, "down": SpriteSequence, "left": SpriteSequence, "right": SpriteSequence, "explode": SpriteSequence}[]} */
export const enemySprites = [
	// Enemy type #0
	{
		"up": {
			frames: [enemy1_left1, enemy1_left2, enemy1_left3, enemy1_left2, enemy1_right1, enemy1_right2, enemy1_right3, enemy1_right2],
			animationSpeed: 6
		},
		"down": {
			frames: [enemy1_left1, enemy1_left2, enemy1_left3, enemy1_left2, enemy1_right1, enemy1_right2, enemy1_right3, enemy1_right2],
			animationSpeed: 6
		},
		"left": {
			frames: [enemy1_left1, enemy1_left2, enemy1_left3, enemy1_left2],
			animationSpeed: 6
		},
		"right": {
			frames: [enemy1_right1, enemy1_right2, enemy1_right3, enemy1_right2],
			animationSpeed: 6
		},
		"explode": {
			frames: [enemy1_explode1, enemy1_explode1, enemy1_explode2, enemy1_explode3, enemy1_explode4, enemy1_explode5, enemy1_explode6],
			animationSpeed: 4
		}
	},
	// more to come
];
