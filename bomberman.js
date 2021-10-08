import sprite_brick11 from "./sprites/brick11.png.js";
import sprite_brick12 from "./sprites/brick12.png.js";
import sprite_field1 from "./sprites/field1.png.js";

import * as constants from "./constants.js";
import { dosemu } from "./node_modules/dosemu/index.js";
import { Theme } from "./theme.js";
import { Player } from "./player.js";
import { playerSprites } from "./player-sprites.js";
import * as world from "./world.js";
import { clamp } from "./math.js";
import { Entity } from "./entity.js";

export function init() {
	buildThemes();
	buildCharacterSprites();
	Entity.onEntityCreated = handleEntityCreated;
	Entity.onEntityDestroyed = handleEntityDestroyed;
	reset();

	registerCommandHandlers();
}

export function update(dt) {
	if (!EDIT_MODE) {
		entities.forEach(e => e.update(dt));
	} else {
		updateEditMode(dt);
	}
}

export function draw() {
	if (!EDIT_MODE) {
		[scrollX, scrollY] = getScrollOffsets();
	}

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

	// draw entities below layer 0:
	let iEntity = 0;
	if (!EDIT_MODE) {
		while (iEntity < entities.length && entities[iEntity].layer < 0) {
			entities[iEntity].draw(-scrollX, -scrollY);
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
			entities[iEntity].draw(-scrollX, -scrollY);
			iEntity++;
		}

		if (playerHasDied) {
			drawLoserBox();
		}
	}

	if (EDIT_MODE) {
		drawEditModeOverlay(tileOffsX, tileOffsY, nTilesX, nTilesY);
	}
}

// --------------------------------------------------------------------------------------------------

let EDIT_MODE = false;
const EDIT_MODE_SCROLL_SPEED = 100; // pixels per second
let editTileType = 1;
let editScrollX = 0;
let editScrollY = 0;

/** @type {Theme[]} */
const themes = [];

let selectedTheme = 0;

/** @type {Player} */
let player = null;

let playerHasDied = false;

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
	[2, 9, 0, 1, 0, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 9, 2],
	[2, 0, 1, 1, 0, 1, 1, 2, 1, 1, 2, 1, 0, 0, 0, 1, 1, 1, 0, 2, 0, 1, 2, 0, 1, 1, 1, 1, 0, 2],
	[2, 1, 1, 2, 3, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 2, 0, 1, 1, 3, 1, 0, 0, 1, 1, 2],
	[2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 2, 3, 1, 1, 1, 1, 2, 2, 2, 2, 2],
	[2, 1, 1, 0, 0, 2, 1, 0, 1, 1, 0, 1, 2, 1, 0, 0, 1, 1, 1, 2, 0, 0, 1, 0, 1, 2, 0, 0, 2, 2],
	[2, 1, 1, 1, 1, 2, 2, 3, 1, 0, 1, 2, 2, 1, 1, 4, 2, 1, 0, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 2],
	[2, 3, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 2],
	[2, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 2, 2, 1, 0, 1, 1, 1, 1, 1, 0, 2],
	[2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 2, 2, 2, 1, 0, 2],
	[2, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 4, 1, 1, 2, 0, 1, 0, 0, 2],
	[2, 1, 0, 1, 0, 1, 1, 2, 0, 1, 0, 1, 0, 2, 4, 1, 1, 1, 2, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 2],
	[2, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 0, 2, 2, 2, 2, 2, 2],
	[2, 1, 0, 1, 1, 2, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
	[2, 2, 2, 1, 0, 2, 3, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 0, 1, 1, 0, 2, 1, 1, 1, 2],
	[2, 1, 0, 1, 1, 2, 0, 1, 1, 1, 1, 2, 2, 2, 1, 0, 1, 0, 0, 2, 2, 3, 1, 0, 1, 3, 0, 0, 2, 2],
	[2, 1, 1, 2, 1, 1, 1, 1, 0, 3, 1, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1, 2],
	[2, 0, 1, 1, 0, 3, 1, 1, 1, 1, 1, 2, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 3, 1, 0, 1, 1, 1, 0, 2],
	[2, 9, 0, 1, 1, 1, 2, 0, 1, 1, 0, 2, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, 0, 0, 1, 1, 0, 9, 2],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

const maps = [map0];

/** @type {number[][]} */
let map = [];
let maxMapX = 0;
let maxMapY = 0;
let scrollX = 0;
let scrollY = 0;

/** @type {Entity[]} */
let entities = [];

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
	world.clearData();
	entities = [];
	player = null;
	playerHasDied = false;
	selectMap(0);
	spawnEntities();
	if (!player) {
		console.error(`Player spawn position not found in map!`);
	}

	world.setMap(map);
}

function spawnEntities() {
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
			if (map[i][j] <= 2) {
				continue; // brick type or empty
			}
			// some entity type
			switch (map[i][j]) {
				case 9: // player
					map[i][j] = 0; // leave an empty space below
					if (player) {
						break; // player is already spawned
					}
					const playerX = j * constants.TILE_SIZE + constants.PLAYER_INITIAL_X_OFFS;
					const playerY = i * constants.TILE_SIZE + constants.PLAYER_INITIAL_Y_OFFS;
					player = new Player({
						x: playerX,
						y: playerY,
						speed: constants.PLAYER_INITIAL_SPEED * constants.TILE_SIZE,
						spriteSet: playerSprites[0]
					});
					break;
				default: // enemy
					break;
			}
			map[i][j] = 0; // leave an empty space below entity
		}
	}
}

function selectMap(index) {
	// make a deep copy, so we don't ever alter the map template
	map = maps[index].map(
		row => row.map(x => x)
	);
	maxMapX = map[0].length * constants.TILE_SIZE;
	maxMapY = map.length * constants.TILE_SIZE;
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

function drawTile(row, col, mapDX, mapDY) {
	const tileX = col * constants.TILE_SIZE + mapDX;
	const tileY = row * constants.TILE_SIZE + mapDY;
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

/** @param {Entity} entity */
function handleEntityCreated(entity) {
	entities.push(entity);
	entities.sort((a, b) => a.layer - b.layer);
	world.addEntity(entity);
}

/** @param {Entity} entity */
function handleEntityDestroyed(entity) {
	entities.splice(entities.indexOf(entity), 1);
	world.removeEntity(entity);

	if (entity === player) {
		// player was destroyed, we wait for the explode animation to finish
		setTimeout(() => {
			// TODO respawn or whatever
			playerHasDied = true;
		}, 1500);
	}
}

function drawLoserBox() {
	dosemu.drawBar(70, 85, 245, 115, 0);
	dosemu.drawRectangle(70, 85, 245, 115, 9);
	dosemu.drawRectangle(68, 83, 247, 117, 0);
	dosemu.drawText(160, 100, "You're dead! Loser!", 9, "center");
}

function registerCommandHandlers() {
	dosemu.onKeyDown((key) => {
		switch (key) {
			case "q":
				toggleEditMode();
				break;
			default:
				if (EDIT_MODE) {
					handleEditModeKey(key);
				}
		}
	});
	dosemu.onMouseDown((x, y, btn) => {
		if (btn === 2) {
			nextEditTileType();
		}
	})
}

function toggleEditMode() {
	EDIT_MODE = !EDIT_MODE;
	if (EDIT_MODE) {
		dosemu.showMouse();
		map = maps[0]; // operate on the template directly
	} else {
		dosemu.hideMouse();
		writeMapToConsole();
		reset();
	}
}

function handleEditModeKey(key) {
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
	}
}

function fillMapWithBricks() {
	for (let i=0; i<map.length; i++) {
		for (let j=0; j<map[0].length; j++) {
			if (map[i][j] === 0) {
				map[i][j] = 1;
			}
		}
	}
}

function writeMapToConsole() {
	console.log("[");
	for (let i=0; i<map.length; i++) {
		console.log(`[${map[i].join(', ')}],`);
	}
	console.log("];");
}

function getMouseRowCol() {
	const [mouseX, mouseY] = dosemu.getMousePosition();
	const mouseCol = Math.floor((mouseX + scrollX) / constants.TILE_SIZE);
	const mouseRow = Math.floor((mouseY + scrollY) / constants.TILE_SIZE);
	return [mouseRow, mouseCol];
}

function withinMap(row, col) {
	return row >= 0 && row < map.length && col >= 0 && col < map[0].length;
}

function drawEditModeOverlay(tileOffsX, tileOffsY, nTilesX, nTilesY) {
	for (let i=tileOffsY; i<tileOffsY + nTilesY; i++) {
		for (let j=tileOffsX; j<tileOffsX + nTilesX; j++) {
			if (map[i][j] === 9) {
				// draw the player spawn position
				dosemu.drawSprite(
					j * constants.TILE_SIZE - scrollX + constants.PLAYER_INITIAL_X_OFFS,
					i * constants.TILE_SIZE - scrollY + constants.PLAYER_INITIAL_Y_OFFS,
					playerSprites[0].down.frames[0]
				);
			} else if (map[i][j] > 2) {
				// enemy spawn point
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
					map[i][j].toString(),
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
		case 0: sprite = themes[selectedTheme].fieldSprite; break;
		case 1:
		case 2: sprite = themes[selectedTheme].brickSprites[editTileType - 1]; break;
		case 3:
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

function updateEditMode(dt) {
	if (dosemu.isMouseButtonDown(0)) {
		const [mouseRow, mouseCol] = getMouseRowCol();
		if (withinMap(mouseRow, mouseCol)) {
			map[mouseRow][mouseCol] = editTileType;
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

function nextEditTileType() {
	editTileType = (editTileType + 1) % 10;
}
