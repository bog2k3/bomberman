import { dosemu } from "../common/node_modules/dosemu/index.js";
import { generateRandomMap } from "../common/random-map.js";
import { clientState } from "./client-state.js";
import { playerSprites } from "./player-sprites.js";
import { enemySprites } from "./enemy-sprites.js";
import { clamp } from "../common/math.js";
import * as bombermanDraw from "./draw.js";
import * as constants from "../common/constants.js";

export let ENABLED = false;

const EDIT_MODE_SCROLL_SPEED = 150; // pixels per second
let editTileType = 1; // the type of tile under cursor
let mapTemplate = [];
let scrollX = 0, scrollY = 0;

/** @param {boolean} enabled */
export function setEnabled(enabled) {
	ENABLED = enabled;
	if (ENABLED) {
		scrollX = clientState.scrollX;
		scrollY = clientState.scrollY;
	}
}

/** @param {number[][]} map */
export function setMap(map) {
	// make a deep copy, so we don't alter the original map while editing
	mapTemplate = map.map(
		row => [...row]
	);
}

export function draw() {
	// on which tile we start drawing:
	const tileOffsX = clamp(Math.floor(scrollX / constants.TILE_SIZE), 0, mapTemplate[0].length - 1);
	const tileOffsY = clamp(Math.floor(scrollY / constants.TILE_SIZE), 0, mapTemplate.length - 1);
	// how many tiles to draw:
	const nTilesX = Math.min(Math.ceil(constants.SCREEN_WIDTH / constants.TILE_SIZE) + 1, mapTemplate[0].length - tileOffsX);
	const nTilesY = Math.min(Math.ceil(constants.SCREEN_HEIGHT / constants.TILE_SIZE) + 1, mapTemplate.length - tileOffsY);

	for (let i=tileOffsY; i<tileOffsY + nTilesY; i++) {
		for (let j=tileOffsX; j<tileOffsX + nTilesX; j++) {
			if (![1, 2].includes(mapTemplate[i][j])) {
				bombermanDraw.drawTile(mapTemplate, i, j, -scrollX, -scrollY);
			}
			switch (mapTemplate[i][j]) {
				case 0:
					break; // field is already drawn above
				case 1:
				case 2:
					bombermanDraw.drawTile(mapTemplate, i, j, -scrollX, -scrollY);
					break;
				case 9:
					// draw the player spawn position
					dosemu.drawSprite(
						j * constants.TILE_SIZE - scrollX + constants.PLAYER_INITIAL_X_OFFS,
						i * constants.TILE_SIZE - scrollY + constants.PLAYER_INITIAL_Y_OFFS,
						playerSprites[0].down.frames[0]
					);
					break;
				case 3:
					// enemy type #0 spawn point
					dosemu.drawSprite(
						j * constants.TILE_SIZE - scrollX + constants.ENEMY_INITIAL_X_OFFS,
						i * constants.TILE_SIZE - scrollY + constants.ENEMY_INITIAL_Y_OFFS,
						enemySprites[0].down.frames[0]
					);
					break;
				default:
					// no sprite for this type
					dosemu.drawRectangle(
						j * constants.TILE_SIZE - scrollX + 1,
						i * constants.TILE_SIZE - scrollY + 1,
						(j+1) * constants.TILE_SIZE - scrollX - 2,
						(i+1) * constants.TILE_SIZE - scrollY - 2,
						9
					);
					dosemu.drawText(
						j * constants.TILE_SIZE - scrollX + 8,
						i * constants.TILE_SIZE - scrollY + 8,
						mapTemplate[i][j].toString(),
						9,
						"center"
					);
			}
		}
	}
	const [mouseRow, mouseCol] = getMouseRowCol();
	if (!withinMap(mouseRow, mouseCol)) {
		return;
	}
	let sprite = null;
	let spriteOffsX = 0;
	let spriteOffsY = 0;
	switch (editTileType) {
		case 0: sprite = bombermanDraw.getTheme().fieldSprite; break;
		case 1:
		case 2: sprite = bombermanDraw.getTheme().brickSprites[editTileType - 1]; break;
		case 3:
			sprite = enemySprites[0].down.frames[0];
			spriteOffsX = constants.ENEMY_INITIAL_X_OFFS;
			spriteOffsY = constants.ENEMY_INITIAL_Y_OFFS;
			break;
		case 4:
		case 5:
		case 6:
		case 7:
		case 8: break;
		case 9:
			sprite = playerSprites[0].down.frames[0];
			spriteOffsX = constants.PLAYER_INITIAL_X_OFFS;
			spriteOffsY = constants.PLAYER_INITIAL_Y_OFFS;
			break;
	}
	if (sprite) {
		dosemu.drawSprite(
			mouseCol * constants.TILE_SIZE - scrollX + spriteOffsX,
			mouseRow * constants.TILE_SIZE - scrollY + spriteOffsY,
			sprite,
			true
		);
	} else {
		dosemu.drawText(
			mouseCol * constants.TILE_SIZE - scrollX + constants.TILE_SIZE / 2,
			mouseRow * constants.TILE_SIZE - scrollY + constants.TILE_SIZE / 2,
			editTileType.toString(),
			9,
			"center"
		);
	}
	dosemu.drawRectangle(
		mouseCol * constants.TILE_SIZE - scrollX,
		mouseRow * constants.TILE_SIZE - scrollY,
		mouseCol * constants.TILE_SIZE - scrollX + constants.TILE_SIZE - 1,
		mouseRow * constants.TILE_SIZE - scrollY + constants.TILE_SIZE - 1,
		9
	);
}

export function update(dt) {
	if (dosemu.isMouseButtonDown(0)) {
		const [mouseRow, mouseCol] = getMouseRowCol();
		if (withinMap(mouseRow, mouseCol)) {
			mapTemplate[mouseRow][mouseCol] = editTileType;
		}
	}
	if (dosemu.isKeyPressed("a")) {
		scrollX -= EDIT_MODE_SCROLL_SPEED * dt;
	}
	if (dosemu.isKeyPressed("d")) {
		scrollX += EDIT_MODE_SCROLL_SPEED * dt;
	}
	if (dosemu.isKeyPressed("w")) {
		scrollY -= EDIT_MODE_SCROLL_SPEED * dt;
	}
	if (dosemu.isKeyPressed("s")) {
		scrollY += EDIT_MODE_SCROLL_SPEED * dt;
	}
}

export function nextEditTileType() {
	editTileType = (editTileType + 1) % 10;
	if (editTileType > 3 && editTileType < 9) {
		editTileType = 9; // skip types that are not currently used
	}
}

export function handleKey(key) {
	switch (key) {
		case '`': editTileType = 0; break;
		case '1': editTileType = 1; break;
		case '2': editTileType = 2; break;
		case '3': editTileType = 3; break;
		case '4': editTileType = 4; break;
		case '5': editTileType = 5; break;
		case '6': editTileType = 6; break;
		case '7': editTileType = 7; break;
		case '8': editTileType = 8; break;
		case '9': editTileType = 9; break;
		case 'f': fillMapWithBricks(); break;
		case 'c': clearMap(); break;
		case 'r': mapTemplate = generateRandomMap(constants.DEFAULT_MAP_ROWS, constants.DEFAULT_MAP_COLS); break;
	}
}

export function writeMapToConsole() {
	let str = "[\n";
	for (let i=0; i<mapTemplate.length; i++) {
		str += `\t[${mapTemplate[i].join(', ')}],\n`;
	}
	str += "]\n";
	console.log(str);
}


// --------------------------------------------------------------------------------------------------

function getMouseRowCol() {
	const [mouseX, mouseY] = dosemu.getMousePosition();
	const mouseCol = Math.floor((mouseX + scrollX) / constants.TILE_SIZE);
	const mouseRow = Math.floor((mouseY + scrollY) / constants.TILE_SIZE);
	return [mouseRow, mouseCol];
}

function withinMap(row, col) {
	return row >= 0 && row < mapTemplate.length && col >= 0 && col < mapTemplate[0].length;
}

function fillMapWithBricks() {
	for (let i=0; i<mapTemplate.length; i++) {
		for (let j=0; j<mapTemplate[0].length; j++) {
			if (mapTemplate[i][j] === 0) {
				mapTemplate[i][j] = 1;
			}
		}
	}
}

function clearMap() {
	for (let i=0; i<mapTemplate.length; i++) {
		for (let j=0; j<mapTemplate[0].length; j++) {
			mapTemplate[i][j] = 0;
		}
	}
}
