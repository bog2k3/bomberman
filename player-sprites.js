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
import { SpriteSequence } from "./sprite-sequence.js";

/** @type {{"up": SpriteSequence, "down": SpriteSequence, "left": SpriteSequence, "right": SpriteSequence}[]} */
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
	},
	// more to come
];
