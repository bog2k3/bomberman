import * as constants from "./constants.js";
import { dosemu } from "./node_modules/dosemu/index.js";
// import { Theme } from "./theme.js";
// import { buildThemes } from "../client/themes.js";
import { Player } from "./player.js";
// import { playerSprites } from "./player-sprites.js";
import * as world from "./world.js";
import { clamp } from "./math.js";
import { Entity } from "./entity.js";
import { Enemy } from "./enemy.js";
// import { enemySprites } from "./enemy-sprites.js";
// import * as raycast from "./raycast.js"
import { PowerupBomb } from "./powerup-bomb.js";
import { PowerupRadius } from "./powerup-radius.js";
import { PowerupSpeed } from "./powerup-speed.js";

export function reset() {
	world.clearData();
	player = null;
	playerHasDied = false;
}

/** @param {boolean} headlessMode True to run in headless mode (no graphics, no user inputs) */
export function init(headlessMode) {
	Entity.onEntityCreated = handleEntityCreated;
	Entity.onEntityDestroyed = handleEntityDestroyed;
	world.setOnBrickDestroyedCallback(handleBrickDestroyed);
	reset();

	if (!headlessMode) {
		registerCommandHandlers();
		raycast.init();
	}
}

export function startGame(mapTemplate) {
	selectMap(mapTemplate);
}

export function update(dt) {
	if (!EDIT_MODE) {
		world.update(dt);
		if (enable3DMode) {
			raycast.update(player, dt);
		}
	} else {
		updateEditMode(dt);
	}
}

// --------------------------------------------------------------------------------------------------

let enable3DMode = false;

let EDIT_MODE = false;

/** @type {Theme[]} */
const themes = buildThemes();

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
	mapTemplate = template;
	// make a deep copy, so we don't ever alter the map template while playing
	map = mapTemplate.map(
		row => row.map(x => x)
	);
	maxMapX = map[0].length * constants.TILE_SIZE;
	maxMapY = map.length * constants.TILE_SIZE;

	world.setMap(map);
	spawnEntities();
}

/** @param {Entity} entity */
function handleEntityCreated(entity) {
	world.addEntity(entity);
	world.getEntities().sort((a, b) => a.layer - b.layer);
}

/** @param {Entity} entity */
function handleEntityDestroyed(entity) {
	world.removeEntity(entity);

	if (entity === player) {
		// player was destroyed, we wait for the explode animation to finish
		setTimeout(() => {
			// TODO respawn or whatever
			playerHasDied = true;
		}, 1500);
	}
}

function handleBrickDestroyed(row, col) {
	const diceFaces = [{
		chance: constants.CHANCE_SPAWN_SPEED_POWERUP,
		action: () => new PowerupSpeed(row, col)
	}, {
		chance: constants.CHANCE_SPAWN_BOMB_POWERUP,
		action: () => new PowerupBomb(row, col)
	}, {
		chance: constants.CHANCE_SPAWN_RADIUS_POWERUP,
		action: () => new PowerupRadius(row, col)
	}, ];
	const totalChanceToSpawn = diceFaces.reduce((prev, crt) => prev + crt.chance, 0);
	const chanceToNotSpawnPowerup = diceFaces.reduce((prev, crt) => prev * (1 - crt.chance), 1);
	let dice = Math.random() * (totalChanceToSpawn + chanceToNotSpawnPowerup);
	for (let face of diceFaces) {
		if (dice < face.chance) {
			face.action();
			break;
		} else {
			dice -= face.chance;
		}
	}
}
