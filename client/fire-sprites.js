import { SpriteSequence } from "./sprite-sequence.js";
import center1 from "./sprites/fire/center-1.png.js";
import center2 from "./sprites/fire/center-2.png.js";
import center3 from "./sprites/fire/center-3.png.js";
import center4 from "./sprites/fire/center-4.png.js";
import middle1 from "./sprites/fire/middle-1.png.js";
import middle2 from "./sprites/fire/middle-2.png.js";
import middle3 from "./sprites/fire/middle-3.png.js";
import middle4 from "./sprites/fire/middle-4.png.js";
import cap1 from "./sprites/fire/cap-1.png.js";
import cap2 from "./sprites/fire/cap-2.png.js";
import cap3 from "./sprites/fire/cap-3.png.js";
import cap4 from "./sprites/fire/cap-4.png.js";

import { dosemuSprite } from "./node_modules/dosemu/index.js";

const fireAnimationSpeed = 8;

export const fireSprites = {
	/** @type {SpriteSequence} */
	center: {
		frames: [center1, center2, center3, center4],
		animationSpeed: fireAnimationSpeed
	},
	/** @type {SpriteSequence} */
	middleH: {
		frames: [middle1, middle2, middle3, middle4],
		animationSpeed: fireAnimationSpeed
	},
	/** @type {SpriteSequence} */
	middleV: {
		frames: [
			dosemuSprite.rotateSprite(middle1, 1),
			dosemuSprite.rotateSprite(middle2, 1),
			dosemuSprite.rotateSprite(middle3, 1),
			dosemuSprite.rotateSprite(middle4, 1)
		],
		animationSpeed: fireAnimationSpeed
	},
	/** @type {SpriteSequence} */
	capRight: {
		frames: [cap1, cap2, cap3, cap4],
		animationSpeed: fireAnimationSpeed
	},
	/** @type {SpriteSequence} */
	capDown: {
		frames: [
			dosemuSprite.rotateSprite(cap1, 1),
			dosemuSprite.rotateSprite(cap2, 1),
			dosemuSprite.rotateSprite(cap3, 1),
			dosemuSprite.rotateSprite(cap4, 1)
		],
		animationSpeed: fireAnimationSpeed
	},
	/** @type {SpriteSequence} */
	capLeft: {
		frames: [
			dosemuSprite.rotateSprite(cap1, 2),
			dosemuSprite.rotateSprite(cap2, 2),
			dosemuSprite.rotateSprite(cap3, 2),
			dosemuSprite.rotateSprite(cap4, 2)
		],
		animationSpeed: fireAnimationSpeed
	},
	/** @type {SpriteSequence} */
	capUp: {
		frames: [
			dosemuSprite.rotateSprite(cap1, 3),
			dosemuSprite.rotateSprite(cap2, 3),
			dosemuSprite.rotateSprite(cap3, 3),
			dosemuSprite.rotateSprite(cap4, 3)
		],
		animationSpeed: fireAnimationSpeed
	}
}
