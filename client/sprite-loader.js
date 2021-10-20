import { dosemuSprite } from "./node_modules/dosemu/index.js";
import { SpriteSequence } from "./sprite-sequence.js";
import { CharacterSpriteSet } from "./character-sprite-set.js";
import { playerSprites } from "./player-sprites.js";
import { enemySprites } from "./enemy-sprites.js";
import { bombSprites } from "./bomb-sprites.js";
import powerupBombSprite from "./sprites/powerups/powerup-bomb.png.js";
import powerupRadiusSprite from "./sprites/powerups/powerup-radius.png.js";
import powerupSpeedSprite from "./sprites/powerups/powerup-speed.png.js";
import { fireSprites } from "./fire-sprites.js";

// export const SpriteLoader = {
// 	/** @returns {CharacterSpriteSet[]} @param {number} index player skin index*/
// 	getPlayerSprites: function(index) {
// 		return playerSprites[index];
// 	},

// 	/** @returns {CharacterSpriteSet[]} @param {number} type type of enemy */
// 	getEnemySprites: function(type) {
// 		return enemySprites[type];
// 	},

// 	/** @returns {SpriteSequence} */
// 	getBombSprites: function() {
// 		return bombSprites;
// 	},

// 	/** @returns {dosemuSprite.Sprite} */
// 	getPowerupBombSprite: function() {
// 		return powerupBombSprite;
// 	},

// 	/** @returns {dosemuSprite.Sprite} */
// 	getPowerupRadiusSprite: function() {
// 		return powerupRadiusSprite;
// 	},

// 	/** @returns {dosemuSprite.Sprite} */
// 	getPowerupSpeedSprite: function() {
// 		return powerupSpeedSprite;
// 	},

// 	getFireSprites: function() {
// 		return fireSprites;
// 	}
// }
