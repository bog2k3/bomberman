import spritePowerupBomb from "./sprites/powerups/powerup-bomb.png.js";
import spritePowerupSpeed from "./sprites/powerups/powerup-speed.png.js";
import spritePowerupRadius from "./sprites/powerups/powerup-radius.png.js";
import { SpriteSequence } from "./sprite-sequence.js";

export const powerupSprites = {
	/** @type {SpriteSequence} */
	bomb: {
		animationSpeed: 1,
		frames: [spritePowerupBomb]
	},

	/** @type {SpriteSequence} */
	speed: {
		animationSpeed: 1,
		frames: [spritePowerupSpeed]
	},

	/** @type {SpriteSequence} */
	radius: {
		animationSpeed: 1,
		frames: [spritePowerupRadius]
	},
};
