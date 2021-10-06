import sprite_brick11 from "./sprites/brick11.png.js";
import sprite_brick12 from "./sprites/brick12.png.js";
import sprite_field1 from "./sprites/field1.png.js";

import { dosemu } from "./node_modules/dosemu/index.js";
import { Theme } from "./theme.js";
import { Character } from "./character.js";
import { Player } from "./player.js";

export function init() {
	buildThemes();
	buildCharacterSprites();
	reset();
}

export function update(dt) {
	player.update(dt);
}

export function draw() {
	[scrollX, scrollY] = getScrollOffsets();
	// on which tile we start drawing:
	const tileOffsX = Math.floor(scrollX / TILE_SIZE);
	const tileOffsY = Math.floor(scrollY / TILE_SIZE);
	// how many tiles to draw:
	const nTilesX = Math.ceil(SCREEN_WIDTH / TILE_SIZE) + 1;
	const nTilesY = Math.ceil(SCREEN_HEIGHT / TILE_SIZE) + 1;

	for (let i=tileOffsY; i<map.length && i<tileOffsY+nTilesY; i++) {
		for (let j=tileOffsX; j<map[0].length && j<tileOffsX+nTilesX; j++) {
			drawTile(i, j, -scrollX, -scrollY);
		}
	}

	player.draw(-scrollX, -scrollY);
}

// --------------------------------------------------------------------------------------------------

const SCREEN_WIDTH = 320;
const SCREEN_HEIGHT = 200;
const TILE_SIZE = 16;
const PLAYER_INITIAL_X_OFFS = 8;
const PLAYER_INITIAL_Y_OFFS = 11;
const PLAYER_INITIAL_SPEED = 10; // tiles per second

/** @type {Theme[]} */
const themes = [];

let selectedTheme = 0;

/**
 * 0 - empty space (field)
 * 1 - regular brick
 * 2 - indestructable brick
 * 3 - enemy type 1
 * 4 - enemy type 2
 * 5 - enemy type 3
 * ...
 * 9 - player
 */
const map0 = [
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	[2, 9, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2],
	[2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 2],
	[2, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 2, 0, 1, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];

const maps = [map0];

/** @type {number[][]} */
let map = [];
let maxMapX = 0;
let maxMapY = 0;
let scrollX = 0;
let scrollY = 0;

let player = new Character();

function buildThemes() {
	themes.push({
		brickSprites: [
			sprite_brick11, sprite_brick12
		],
		fieldSprite: sprite_field1
	});
}

function buildCharacterSprites() {

}

function reset() {
	selectMap(0);
	let [playerRow, playerCol] = findPlayerPosition(map);
	const playerX = playerCol * TILE_SIZE + PLAYER_INITIAL_X_OFFS;
	const playerY = playerRow * TILE_SIZE + PLAYER_INITIAL_Y_OFFS;
	player = new Player(playerX, playerY, PLAYER_INITIAL_SPEED * TILE_SIZE);
}

function selectMap(index) {
	// make a deep copy, so we don't ever alter the map template
	map = maps[index].map(
		row => row.map(x => x)
	);
	maxMapX = map[0].length * TILE_SIZE;
	maxMapY = map.length * TILE_SIZE;
}

function clamp(x, a, b) {
	return Math.max(a, Math.min(x, b));
}

/** @returns {[ofsX: number, ofsY: number]} */
function getScrollOffsets() {
	// start from the last scroll position
	let viewportX = scrollX;
	let viewportY = scrollY;
	// only adjust if the player moves outside a central region
	const playerScreenX = player.x - scrollX;
	const playerScreenY = player.y - scrollY;
	const toleranceX = SCREEN_WIDTH / 8;
	const toleranceY = SCREEN_HEIGHT / 8;
	const centerX = SCREEN_WIDTH / 2;
	const centerY = SCREEN_HEIGHT / 2;
	const differenceX = playerScreenX - centerX;
	const differenceY = playerScreenY - centerY;
	if (Math.abs(differenceX) > toleranceX) {
		viewportX += differenceX - toleranceX * Math.sign(differenceX);
	}
	if (Math.abs(differenceY) > toleranceY) {
		viewportY += differenceY - toleranceY * Math.sign(differenceY);
	}
	// only scroll as much as the map limits
	viewportX = clamp(viewportX, 0, maxMapX - SCREEN_WIDTH);
	viewportY = clamp(viewportY, 0, maxMapY - SCREEN_HEIGHT);

	return [viewportX, viewportY];
}

function drawTile(row, col, mapDX, mapDY) {
	const tileX = col * TILE_SIZE + mapDX;
	const tileY = row * TILE_SIZE + mapDY;
	let sprite = null;
	if ([1, 2].includes(map[row][col])) {
		// brick type
		sprite = themes[selectedTheme].brickSprites[map[row][col] - 1];
	} else {
		// even if the map is not 0 (enemy or player), we still draw a field sprite at that location
		sprite = themes[selectedTheme].fieldSprite;
	}
	if (!sprite) {
		console.log(`no tile sprite for row=${row}, col=${col}, map[][]=${map[row][col]}`);
		return;
	}
	dosemu.drawSprite(tileX, tileY, sprite);
}

/**
 *
 * @param {number[][]} map
 * @returns {[row: number, col: number]} the position of the player
 */
function findPlayerPosition(map) {
	for (let i=0; i<map.length; i++) {
		for (let j=0; j<map[i].length; j++) {
			if (map[i][j] === 9)
				return [i, j];
		}
	}
	console.error(`Player position not found in map!`);
	return [0, 0];
}
