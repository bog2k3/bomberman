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
import { Enemy } from "./enemy.js";
import { enemySprites } from "./enemy-sprites.js";
import { mapsCollection } from "./maps.js";
import * as raycast from "./raycast.js"

export function init() {
	buildThemes();
	Entity.onEntityCreated = handleEntityCreated;
	Entity.onEntityDestroyed = handleEntityDestroyed;
	reset();
	// selectMap(mapsCollection[1]); // select a specific map
	selectMap(); // no arguments will create a random map

	registerCommandHandlers();

	raycast.init();
}

export function update(dt) {
	if (!EDIT_MODE) {
		entities.forEach(e => e.update(dt));
		if (enable3DMode) {
			raycast.update(player, dt);
		}
	} else {
		updateEditMode(dt);
	}
}

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

// --------------------------------------------------------------------------------------------------

let enable3DMode = false;

let EDIT_MODE = false;
const EDIT_MODE_SCROLL_SPEED = 150; // pixels per second
let editTileType = 1; // the type of tile under cursor

/** @type {Theme[]} */
const themes = [];

let selectedTheme = 0;

/** @type {Player} */
let player = null;

let playerHasDied = false;

/** @type {number[][]} */
let mapTemplate = []; // the map template
/** @type {number[][]} */
let map = []; // the map instance
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
	}

	if (EDIT_MODE) {
		drawEditModeOverlay(tileOffsX, tileOffsY, nTilesX, nTilesY);
	}
}

function draw3D() {
	raycast.render(map, player, entities, themes[selectedTheme]);
}

function reset() {
	world.clearData();
	entities = [];
	player = null;
	playerHasDied = false;
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
					const enemyX = j * constants.TILE_SIZE + constants.ENEMY_INITIAL_X_OFFS;
					const enemyY = i * constants.TILE_SIZE + constants.ENEMY_INITIAL_Y_OFFS;
					let enemyType = map[i][j] - 3;
					enemyType = 0; // TODO remove hardcoding after adding all the sprites
					new Enemy({
						x: enemyX,
						y: enemyY,
						type: enemyType,
						speed: constants.ENEMY_SPEED[enemyType] * constants.TILE_SIZE,
						spriteSet: enemySprites[enemyType]
					});
					break;
			}
			map[i][j] = 0; // leave an empty space below entity
		}
	}
	if (!player) {
		console.error(`Player spawn position not found in map!`);
	}
}

/** @param {number[][]} mapTemplate (Optional) the template to instantiate the map from; if missing, a random map will be generated */
function selectMap(template) {
	mapTemplate = template || randomMap(constants.DEFAULT_MAP_ROWS, constants.DEFAULT_MAP_COLS);
	// make a deep copy, so we don't ever alter the map template while playing
	map = mapTemplate.map(
		row => row.map(x => x)
	);
	maxMapX = map[0].length * constants.TILE_SIZE;
	maxMapY = map.length * constants.TILE_SIZE;

	world.setMap(map);
	spawnEntities();
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
		// if the map is 0 or a non-brick value (enemy or player), we draw a field sprite at that location
		sprite = themes[selectedTheme].fieldSprite;
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
			case "e":
				toggle3dMode();
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

function toggle3dMode() {
	enable3DMode = !enable3DMode;
	player.movementInputEnabled = !enable3DMode;
	if (enable3DMode) {
		raycast.updatePlayerAngle(player);
	}
}

function toggleEditMode() {
	EDIT_MODE = !EDIT_MODE;
	enable3DMode = false;
	if (EDIT_MODE) {
		dosemu.showMouse();
		map = mapTemplate; // operate on the template directly while editing
	} else {
		dosemu.hideMouse();
		writeMapToConsole();
		reset();
		selectMap(mapTemplate);
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
		case 'c': clearMap(); break;
		case 'r': map = mapTemplate = randomMap(constants.DEFAULT_MAP_ROWS, constants.DEFAULT_MAP_COLS); break;
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

function clearMap() {
	for (let i=0; i<map.length; i++) {
		for (let j=0; j<map[0].length; j++) {
			map[i][j] = 0;
		}
	}
}

/**
 * Generates and returns a random map
 * @param {number} nRows number of rows for the map
 * @param {number} nCols number of columns
 */
function randomMap(nRows, nCols) {
	let theMap = [];
	// create empty map:
	for (let i=0; i<nRows; i++) {
		theMap.push([]);
		for (let j=0; j<nCols; j++) {
			theMap[i][j] = 0;
		}
	}
	// top and bottom borders:
	for (let i=0; i<nCols; i++) {
		theMap[0][i] = 2;
		theMap[nRows-1][i] = 2;
	}
	// left and right borders:
	for (let i=0; i<nRows; i++) {
		theMap[i][0] = 2;
		theMap[i][nCols-1] = 2;
	}
	const fillFactor = constants.RANDOM_MAP_FILL_FACTOR_MIN + (constants.RANDOM_MAP_FILL_FACTOR_MAX - constants.RANDOM_MAP_FILL_FACTOR_MIN) * Math.random();
	// destructable bricks:
	for (let i=1; i<nRows-1; i++) {
		for (let j=1; j<nCols-1; j++) {
			if (i%2===0 && j%2===0) {
				theMap[i][j] = 2;
			} else {
				if (Math.random() < fillFactor) {
					theMap[i][j] = 1;
				}
			}
		}
	}
	// player spawn positions:
	const halfRow = Math.floor(nRows/2);
	const halfCol = Math.floor(nCols/2);
	const playerSpawnPositions = [
		[1, 1],
		[1, nCols-2],
		[nRows-2, 1],
		[nRows-2, nCols-2],
		[halfRow, halfCol],
		[1, halfCol],
		[nRows-2,halfCol]
	];
	for (let pos of playerSpawnPositions) {
		const row = pos[0], col = pos[1];
		if (theMap[row, col] === 2) {
			// we landed on an indestructable brick, shift the position
			if (col <= halfCol) {
				col++;
			} else {
				col--;
			}
		}
		pos[0] = row; // update the altered position in the array since we'll use them later
		pos[1] = col;
		theMap[row][col] = 9;
		// make some room around
		if (theMap[row-1][col] === 1) {
			theMap[row-1][col] = 0;
		}
		if (theMap[row+1][col] === 1) {
			theMap[row+1][col] = 0;
		}
		if (theMap[row][col-1] === 1) {
			theMap[row][col-1] = 0;
		}
		if (theMap[row][col+1] === 1) {
			theMap[row][col+1] = 0;
		}
	}
	// create some enemies:
	let enemyCount = Math.floor(nRows * nCols * constants.RANDOM_MAP_ENEMY_DENSITY);
	const enemySpawnPositions = [];
	while (enemyCount > 0) {
		let foundSuitablePosition = false;
		let nTries = 0;
		while (!foundSuitablePosition && nTries < 20) {
			let row = Math.floor(Math.random() * nRows);
			let col = Math.floor(Math.random() * nCols);
			if (isValidPositionForEnemy(row, col, theMap, playerSpawnPositions, enemySpawnPositions)) {
				foundSuitablePosition = true;
				theMap[row][col] = 3;
				enemySpawnPositions.push([row, col]);
				enemyCount--;
			} else {
				nTries++;
			}
		}
		if (!foundSuitablePosition) {
			enemyCount = 0; // we can't place any more enemies
		}
	}
	return theMap;
}

function isValidPositionForEnemy(row, col, map, playerSpawnPos, enemySpawnPositions) {
	// valid positions for an enemy are at sufficient manhattan distance from a player spawn pos and all other enemies
	// and are not on indestructable bricks
	const minDistance = 4;
	if (map[row][col] === 2) {
		return false;
	}
	for (let spawnPos of [...playerSpawnPos, ...enemySpawnPositions]) {
		const dist = Math.abs(spawnPos[0] - row) + Math.abs(spawnPos[1] - col);
		if (dist < minDistance) {
			return false;
		}
	}
	return true;
}

function writeMapToConsole() {
	let str = "[\n";
	for (let i=0; i<map.length; i++) {
		str += `\t[${map[i].join(', ')}],\n`;
	}
	str += "]\n";
	console.log(str);
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
			switch (map[i][j]) {
				case 0:
				case 1:
				case 2:
					break; // these are bricks already drawn
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
	if (editTileType > 3 && editTileType < 9) {
		editTileType = 9; // skip types that are not currently used
	}
}
