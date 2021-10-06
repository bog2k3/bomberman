import sprite_brick11 from "./sprites/brick11.png.js";
import sprite_brick12 from "./sprites/brick12.png.js";
import sprite_field1 from "./sprites/field1.png.js";

import { dosemu } from "./node_modules/dosemu/index.js";
import { Theme } from "./theme.js";
import { Character } from "./character.js";

export function init() {
	buildThemes();
	buildCharacterSprites();
	reset();
}

export function udpate(dt) {

}

export function draw() {
	const [ofsX, ofsY] = getScrollOffsets();
	// on which tile we start drawing:
	const tileOffsX = Math.floor(ofsX / TILE_SIZE);
	const tileOffsY = Math.floor(ofsY / TILE_SIZE);
	// how many tiles to draw:
	const nTilesX = Math.ceil(SCREEN_WIDTH / TILE_SIZE);
	const nTilesY = Math.ceil(SCREEN_HEIGHT / TILE_SIZE);

	for (let i=tileOffsY; i<map.length && i<tileOffsY+nTilesY; i++) {
		for (let j=tileOffsX; j<map[0].length && j<tileOffsX+nTilesX; j++) {
			drawTile(i, j, -ofsX, -ofsY);
		}
	}
}

// --------------------------------------------------------------------------------------------------

const SCREEN_WIDTH = 320;
const SCREEN_HEIGHT = 200;
const TILE_SIZE = 16;

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
	[2, 0, 0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];

const maps = [map0];

/** @type {number[][]} */
let map = [];
let maxMapX = 0;
let maxMapY = 0;

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
	player = new Character();
}

function selectMap(index) {
	// make a deep copy, so we don't ever alter the map template
	map = maps[index].map(
		row => row.map(x => x)
	);
	maxMapX = map.length * TILE_SIZE;
	maxMapY = map[0].length * TILE_SIZE;
}

function clamp(x, a, b) {
	return Math.max(a, Math.min(x, b));
}

/** @returns {[ofsX: number, ofsY: number]} */
function getScrollOffsets() {
	// try to keep the player centered:
	let viewportX = player.x - SCREEN_WIDTH/2;
	let viewportY = player.y - SCREEN_HEIGHT/2;
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
