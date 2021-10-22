import { dosemu } from "../common/node_modules/dosemu/index.js";
import { Bomb } from "../common/bomb.js";
import { Enemy } from "../common/enemy.js";
import { Entity } from "../common/entity.js";
import { Fire } from "../common/fire.js";
import { GridEntity } from "../common/grid-entity.js";
import { Player } from "../common/player.js";
import { bombSprites } from "./bomb-sprites.js";
import { CharacterSpriteSet } from "./character-sprite-set.js";
import { Character } from "../common/character.js";
import { enemySprites } from "./enemy-sprites.js";
import { fireSprites } from "./fire-sprites.js";
import { playerSprites } from "./player-sprites.js";
import { SpriteSequence } from "./sprite-sequence.js";
import { clientState } from "./client-state.js";
import { buildThemes } from "./themes.js";
import { clamp } from "../common/math.js";
import { CharacterExplodeAnimation } from "./character-explode-animation.js";
import * as world from "../common/world.js";
import * as constants from "../common/constants.js";
import { powerupSprites } from "./powerup-sprites.js";

// --------------------------------------------------------------------------------------------------

const themes = buildThemes();
let selectedTheme = 0;

// --------------------------------------------------------------------------------------------------

export function draw() {
	[clientState.scrollX, clientState.scrollY] = getScrollOffsets();

	if (clientState.enable3DMode) {
		draw3D();
	} else {
		draw2D();
	}
	if (clientState.playerHasDied) {
		drawLoserBox();
	}
}

// --------------------------------------------------------------------------------------------------

function draw2D() {
	const map = world.getMap();
	// on which tile we start drawing:
	const tileOffsX = clamp(Math.floor(clientState.scrollX / constants.TILE_SIZE), 0, map[0].length - 1);
	const tileOffsY = clamp(Math.floor(clientState.scrollY / constants.TILE_SIZE), 0, map.length - 1);
	// how many tiles to draw:
	const nTilesX = Math.min(Math.ceil(constants.SCREEN_WIDTH / constants.TILE_SIZE) + 1, map[0].length - tileOffsX);
	const nTilesY = Math.min(Math.ceil(constants.SCREEN_HEIGHT / constants.TILE_SIZE) + 1, map.length - tileOffsY);

	// draw field (background):
	for (let i = tileOffsY; i < map.length && i < tileOffsY + nTilesY; i++) {
		for (let j = tileOffsX; j < map[0].length && j < tileOffsX + nTilesX; j++) {
			if (map[i][j] === 0) {
				drawTile(map, i, j, -clientState.scrollX, -clientState.scrollY);
			}
		}
	}

	const entities = world.getEntities();

	// draw entities below layer 0:
	let iEntity = 0;
	while (iEntity < entities.length && entities[iEntity].layer < 0) {
		drawEntity(entities[iEntity], -clientState.scrollX, -clientState.scrollY);
		iEntity++;
	}

	// draw bricks (layer 0):
	for (let i = tileOffsY; i < map.length && i < tileOffsY + nTilesY; i++) {
		for (let j = tileOffsX; j < map[0].length && j < tileOffsX + nTilesX; j++) {
			if (map[i][j] !== 0) {
				drawTile(map, i, j, -clientState.scrollX, -clientState.scrollY);
			}
		}
	}

	// draw entities above layer 0:
	while (iEntity < entities.length) {
		drawEntity(entities[iEntity], -clientState.scrollX, -clientState.scrollY);
		iEntity++;
	}
}

/**
 * @param {number[][]} map
 * @param {number} row
 * @param {number} col
 * @param {number} mapDX
 * @param {number} mapDY
 */
function drawTile(map, row, col, mapDX, mapDY) {
	const tileX = col * constants.TILE_SIZE + mapDX;
	const tileY = row * constants.TILE_SIZE + mapDY;
	let sprite = null;
	if ([1, 2].includes(map[row][col])) {
		// brick type
		sprite = themes[selectedTheme].brickSprites[map[row][col] - 1];
	} else {
		// if the map is 0 or a non-brick value (enemy or player), we draw a field sprite at that location
		sprite = themes[selectedTheme].fieldSprite;
	}
	dosemu.drawSprite(tileX, tileY, sprite);
}

/**
 * @param {string} text
 * @param {"left" | "center" | "right"} alignment
 **/
function drawShadowedText(x, y, text, color, shadowColor, alignment) {
	dosemu.drawText(x + 1, y + 1, text, shadowColor, alignment);
	dosemu.drawText(x, y, text, color, alignment);
}

function drawLoserBox() {
	const texts = [{
		text: "You're dead! Loser!",
		color: 9
	}, {
		text: "Press ENTER to respawn",
		color: 11
	}];
	const padding = 15;
	const lineHeight = 10;
	const lineGap = 5;
	const charWidth = 8;
	const maxLength = Math.max(...texts.map(t => t.text.length));
	const boxWidth = maxLength * charWidth + padding * 2 + 2;
	const boxHalfWidth = boxWidth >> 1;
	const boxHeight = texts.length * lineHeight + (texts.length-1) * lineGap + padding * 2 + 2;
	const boxHalfHeight = boxHeight >> 1;
	const x1 = 160 - boxHalfWidth;
	const y1 = 100 - boxHalfHeight;
	const x2 = 160 + boxHalfWidth;
	const y2 = 100 + boxHalfHeight;
	dosemu.drawBar(x1, y1, x2, y2, 0);
	dosemu.drawRectangle(x1, y1, x2, y2, 9);
	dosemu.drawRectangle(x1 - 2, y1 - 2, x2 + 2, y2 + 2, 0);
	let textY = y1 + lineHeight / 2 + padding + 2;
	for (let i=0; i<texts.length; i++) {
		drawShadowedText(160, textY, texts[i].text, texts[i].color, 235, "center");
		textY += lineHeight + lineGap;
	}
}


function draw3D() {
	raycast.render(world.getMap(), clientState.player, world.getEntities(), themes[selectedTheme]);
}

/** @returns {[ofsX: number, ofsY: number]} */
function getScrollOffsets() {
	// start from the last scroll position
	let viewportX = clientState.scrollX;
	let viewportY = clientState.scrollY;
	// only adjust if the player moves outside a central region
	const playerScreenX = clientState.player.x - clientState.scrollX;
	const playerScreenY = clientState.player.y - clientState.scrollY;
	const toleranceX = constants.SCREEN_WIDTH / 8;
	const toleranceY = constants.SCREEN_HEIGHT / 8;
	const centerX = constants.SCREEN_WIDTH / 2;
	const centerY = constants.SCREEN_HEIGHT / 2;
	const differenceX = playerScreenX - centerX;
	const differenceY = playerScreenY - centerY;
	if (Math.abs(differenceX) > toleranceX) {
		viewportX += differenceX - toleranceX * Math.sign(differenceX);
	}
	if (Math.abs(differenceY) > toleranceY) {
		viewportY += differenceY - toleranceY * Math.sign(differenceY);
	}
	const map = world.getMap();
	const maxMapX = map[0].length * constants.TILE_SIZE;
	const maxMapY = map.length * constants.TILE_SIZE;
	// only scroll as much as the map limits
	viewportX = clamp(viewportX, 0, maxMapX - constants.SCREEN_WIDTH);
	viewportY = clamp(viewportY, 0, maxMapY - constants.SCREEN_HEIGHT);

	return [viewportX, viewportY];
}

/** @param {Entity} entity */
function drawEntity(entity, offsX, offsY) {
	if (entity.getType().startsWith("player")) {
		const skinId = Number.parseInt(entity.getType().substr("player-".length));
		return drawPlayer(entity, skinId, offsX, offsY);
	}
	if (entity.getType().startsWith("enemy")) {
		const skinId = Number.parseInt(entity.getType().substr("enemy-".length));
		return drawEnemy(entity, skinId, offsX, offsY);
	}
	switch (entity.getType()) {
		case "bomb":
			return drawBomb(entity, offsX, offsY);
		case "fire":
			return drawFire(entity, offsX, offsY);
		case "character-explode-animation":
			return drawCharacterExplodeAnimation(entity, offsX, offsY);
		case "powerup-bomb":
			return drawGridEntity(entity, powerupSprites.bomb, offsX, offsY);
		case "powerup-radius":
			return drawGridEntity(entity, powerupSprites.radius, offsX, offsY);
		case "powerup-speed":
			return drawGridEntity(entity, powerupSprites.speed, offsX, offsY);
		default:
			throw `entity type not handled in draw: ${entity.getType()}`;
	}
}

/** @param {Player} player */
function drawPlayer(player, skinId, offsX, offsY) {
	drawCharacter(player, playerSprites[skinId], offsX, offsY); // TODO use skin by spawn slot id
}

/** @param {Enemy} enemy */
function drawEnemy(enemy, skinId, offsX, offsY) {
	drawCharacter(enemy, enemySprites[skinId], offsX, offsY);
}

/** @param {Bomb} bomb */
function drawBomb(bomb, offsX, offsY) {
	drawGridEntity(bomb, bombSprites, offsX, offsY);
}

/** @param {Fire} fire */
function drawFire(fire, offsX, offsY) {
	drawGridEntity(fire, fireSprites[fire.type], offsX, offsY);
}

/**
 * @param {Character} character
 * @param {CharacterSpriteSet} spriteSet
 **/
function drawCharacter(character, spriteSet, offsX, offsY) {
	const spriteSeq = spriteSet[character.orientation];
	if (character.isStopped) {
		// reset to the first frame, but right before switching to the second,
		// so when the character starts moving, the animation starts right away.
		character.animationController.animationProgress = 0.9 / spriteSeq.animationSpeed;
	}
	if (!spriteSeq) {
		console.error(`Missing spriteSet for orientation="${character.orientation}" in Character `, character);
		return;
	}
	const currentFrame = character.animationController.getCurrentFrame(spriteSeq.frames.length);
	if (!spriteSeq.frames || !spriteSeq.frames[currentFrame]) {
		console.error(`Missing animation frame ${currentFrame} in spriteSet for orientation="${character.orientation}" in Character `, character);
		return
	}
	dosemu.drawSprite(character.x + offsX, character.y + offsY, spriteSeq.frames[currentFrame]);
}

/**
 * @param {GridEntity} entity
 * @param {SpriteSequence} spriteSequence
 * */
function drawGridEntity(entity, spriteSequence, offsX, offsY) {
	const currentFrame = entity.animationController.getCurrentFrame(spriteSequence.frames.length);
	dosemu.drawSprite(
		offsX + (entity.column + 0.5) * constants.TILE_SIZE,
		offsY + (entity.row + 0.5) * constants.TILE_SIZE,
		spriteSequence.frames[currentFrame]
	);
}

/**
 * @param {CharacterExplodeAnimation} entity
 * @param {number} offsX
 * @param {number} offsY
 */
function drawCharacterExplodeAnimation(entity, offsX, offsY) {
	const spriteSeq = getSpriteSequenceForAnimation(entity, "explode");
	const currentFrame = entity.animationController.getCurrentFrame(spriteSeq.frames.length);
	dosemu.drawSprite(
		offsX + entity.x,
		offsY + entity.y,
		spriteSeq.frames[currentFrame]
	);
}

/**
 * @param {Entity} entity
 * @param {string} animationName
 * @returns {SpriteSequence}
 */
function getSpriteSequenceForAnimation(entity, animationName) {
	if (entity.getType().startsWith("player")) {
		const skinId = Number.parseInt(entity.getType().substr("player-".length));
		return playerSprites[skinId][animationName];
	}
	if (entity.getType().startsWith("enemy")) {
		const skinId = Number.parseInt(entity.getType().substr("enemy-".length));
		return enemySprites[skinId][animationName];
	}
	switch(entity.getType()) {
		case "bomb":
			return bombSprites;
		case "fire":
			return fireSprites[animationName];
		case "character-explode-animation":
			return getSpriteSequenceForCharacterExplodeAnimation(entity);
		case "powerup-bomb":
			return powerupSprites.bomb;
		case "powerup-radius":
			return powerupSprites.radius;
		case "powerup-speed":
			return powerupSprites.speed;
		default:
			throw `entity type not handled in getSpriteSequenceForAnimation: ${entityType}`;
	}
}

/** @param {CharacterExplodeAnimation} entity */
function getSpriteSequenceForCharacterExplodeAnimation(entity) {
	if (entity.type.startsWith("player")) {
		const skinId = Number.parseInt(entity.type.substr("player-".length));
		return playerSprites[skinId].explode;
	} else if (entity.type.startsWith("enemy")) {
		const skinId = Number.parseInt(entity.type.substr("enemy-".length));
		return enemySprites[skinId].explode;
	} else {
		throw `unhandled CharacterExplodeAnimation type "${entity.type}" in getSpriteSequenceForCharacterExplodeAnimation()"`;
	}
}

/**
 * @param {Entity} entity
 * @param {String} animationName
 **/
function configureAnimationController(entity, animationName) {
	entity.animationController.setDurationFromSpriteSeq(
		getSpriteSequenceForAnimation(entity, animationName)
	);
}

/** @param {Entity} entity */
function handleEntityCreated(entity) {
	entity.onAnimationStart.subscribe(
		(animationName) => configureAnimationController(entity, animationName)
	)
}

// --------------------------------------------------------------------------------------------------

(function init() {
	Entity.onEntityCreated.subscribe(handleEntityCreated);
})();
