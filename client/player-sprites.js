import player1_down1 from "./sprites/player1/down-1.png.js";
import player1_down2 from "./sprites/player1/down-2.png.js";
import player1_down3 from "./sprites/player1/down-3.png.js";
import player1_up1 from "./sprites/player1/up-1.png.js";
import player1_up2 from "./sprites/player1/up-2.png.js";
import player1_up3 from "./sprites/player1/up-3.png.js";
import player1_left1 from "./sprites/player1/left-1.png.js";
import player1_left2 from "./sprites/player1/left-2.png.js";
import player1_left3 from "./sprites/player1/left-3.png.js";
import player1_right1 from "./sprites/player1/right-1.png.js";
import player1_right2 from "./sprites/player1/right-2.png.js";
import player1_right3 from "./sprites/player1/right-3.png.js";
import player1_explode1 from "./sprites/player1/explode-1.png.js";
import player1_explode2 from "./sprites/player1/explode-2.png.js";
import player1_explode3 from "./sprites/player1/explode-3.png.js";
import player1_explode4 from "./sprites/player1/explode-4.png.js";
import player1_explode5 from "./sprites/player1/explode-5.png.js";
import player1_explode6 from "./sprites/player1/explode-6.png.js";
import player1_explode7 from "./sprites/player1/explode-7.png.js";
import { CharacterSpriteSet } from "./character-sprite-set.js";

/** @type {CharacterSpriteSet[]} */
export const playerSprites = [
	// Player 1
	{
		"up": {
			frames: [player1_up1, player1_up2, player1_up1, player1_up3],
			animationSpeed: 10
		},
		"down": {
			frames: [player1_down1, player1_down2, player1_down1, player1_down3],
			animationSpeed: 10
		},
		"left": {
			frames: [player1_left1, player1_left2, player1_left1, player1_left3],
			animationSpeed: 10
		},
		"right": {
			frames: [player1_right1, player1_right2, player1_right1, player1_right3],
			animationSpeed: 10
		},
		"explode": {
			frames: [player1_explode1, player1_explode2, player1_explode3, player1_explode4, player1_explode5, player1_explode6, player1_explode7],
			animationSpeed: 5
		}
	},
	// more to come
];
