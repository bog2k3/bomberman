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

export function draw() {
	if (!EDIT_MODE) {
		[scrollX, scrollY] = getScrollOffsets();
	}

	if (!EDIT_MODE && enable3DMode) {
		draw3D();
	} else {
		draw2D();
	}
	if (!EDIT_MODE && playerHasDied) {
		drawLoserBox();
	}
}

function draw2D() {
	// on which tile we start drawing:
	const tileOffsX = clamp(Math.floor(scrollX / constants.TILE_SIZE), 0, map[0].length - 1);
	const tileOffsY = clamp(Math.floor(scrollY / constants.TILE_SIZE), 0, map.length - 1);
	// how many tiles to draw:
	const nTilesX = Math.min(Math.ceil(constants.SCREEN_WIDTH / constants.TILE_SIZE) + 1, map[0].length - tileOffsX);
	const nTilesY = Math.min(Math.ceil(constants.SCREEN_HEIGHT / constants.TILE_SIZE) + 1, map.length - tileOffsY);

	// draw field (background):
	for (let i = tileOffsY; i < map.length && i < tileOffsY + nTilesY; i++) {
		for (let j = tileOffsX; j < map[0].length && j < tileOffsX + nTilesX; j++) {
			if (map[i][j] === 0) {
				drawTile(i, j, -scrollX, -scrollY);
			}
		}
	}

	const entities = world.getEntities();

	// draw entities below layer 0:
	let iEntity = 0;
	if (!EDIT_MODE) {
		while (iEntity < entities.length && entities[iEntity].layer < 0) {
			drawEntity(entities[iEntity], -scrollX, -scrollY);
			iEntity++;
		}
	}

	// draw bricks (layer 0):
	for (let i = tileOffsY; i < map.length && i < tileOffsY + nTilesY; i++) {
		for (let j = tileOffsX; j < map[0].length && j < tileOffsX + nTilesX; j++) {
			if (map[i][j] !== 0) {
				drawTile(i, j, -scrollX, -scrollY);
			}
		}
	}

	if (!EDIT_MODE) {
		// draw entities above layer 0:
		while (iEntity < entities.length) {
			drawEntity(entities[iEntity], -scrollX, -scrollY);
			iEntity++;
		}
	}

	if (EDIT_MODE) {
		drawEditModeOverlay(tileOffsX, tileOffsY, nTilesX, nTilesY);
	}
}

function drawTile(row, col, mapDX, mapDY) {
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

function drawLoserBox() {
	dosemu.drawBar(70, 85, 245, 115, 0);
	dosemu.drawRectangle(70, 85, 245, 115, 9);
	dosemu.drawRectangle(68, 83, 247, 117, 0);
	dosemu.drawText(160, 100, "You're dead! Loser!", 9, "center");
}


function draw3D() {
	raycast.render(map, player, world.getEntities(), themes[selectedTheme]);
}

/** @returns {[ofsX: number, ofsY: number]} */
function getScrollOffsets() {
	// start from the last scroll position
	let viewportX = scrollX;
	let viewportY = scrollY;
	// only adjust if the player moves outside a central region
	const playerScreenX = player.x - scrollX;
	const playerScreenY = player.y - scrollY;
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
	// only scroll as much as the map limits
	viewportX = clamp(viewportX, 0, maxMapX - constants.SCREEN_WIDTH);
	viewportY = clamp(viewportY, 0, maxMapY - constants.SCREEN_HEIGHT);

	return [viewportX, viewportY];
}

/** @param {Entity} entity */
function drawEntity(entity, offsX, offsY) {
	switch (entity.getType()) {
		case "player":
			return drawPlayer(entity, offsX, offsY);
		case "enemy-0":
			return drawEnemy(entity, 0, offsX, offsY);
		case "bomb":
			return drawBomb(entity, offsX, offsY);
		case "fire":
			return drawFire(entity, offsX, offsY);
	}
}

/** @param {Player} player */
function drawPlayer(player, offsX, offsY) {
	drawCharacter(player, playerSprites, offsX, offsY);
}

/** @param {Enemy} enemy */
function drawEnemy(enemy, type, offsX, offsY) {
	drawCharacter(enemy, enemySprites[type], offsX, offsY);
}

/** @param {Bomb} bomb */
function drawBomb(bomb, offsX, offsY) {
	drawGridEntity(bomb, bombSprites, offsX, offsY);
}

/** @param {Fire} fire */
function drawFire(fire, offsX, offsY) {
	drawGridEntity(fire, fireSprites, offsX, offsY);
}

/**
 * @param {Character} character
 * @param {CharacterSpriteSet} spriteSet
 **/
function drawCharacter(character, spriteSet, offsX, offsY) {
	const spriteSeq = spriteSet[character.orientation];
	if (!spriteSeq) {
		console.error(`Missing spriteSet for orientation="${character.orientation}" in Character `, character);
	}
	const currentFrame = Math.floor(character.animationTime * spriteSeq.animationSpeed) % spriteSeq.frames.length;
	if (!spriteSeq.frames || !spriteSeq.frames[currentFrame]) {
		console.error(`Missing animation frame ${currentFrame} in spriteSet for orientation="${character.orientation}" in Character `, character);
	}
	dosemu.drawSprite(character.x + mapOffsX, character.y + mapOffsY, spriteSeq.frames[currentFrame]);
}

/**
 * @param {GridEntity} entity
 * @param {SpriteSequence} spriteSequence
 * */
function drawGridEntity(entity, spriteSequence, offsX, offsY) {
	const currentFrame = Math.floor(entity.animationTime * spriteSequence.animationSpeed) % spriteSequence.frames.length;
	dosemu.drawSprite(
		offsX + (entity.column + 0.5) * constants.TILE_SIZE,
		offsY + (entity.row + 0.5) * constants.TILE_SIZE,
		spriteSequence.frames[currentFrame]
	);
}
