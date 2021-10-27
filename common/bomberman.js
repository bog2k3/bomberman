import * as constants from "./constants.js";
import { Player } from "./player.js";
import * as world from "./world.js";
import { Entity } from "./entity.js";
import { Enemy } from "./enemy.js";
import { PowerupBomb } from "./powerup-bomb.js";
import { PowerupRadius } from "./powerup-radius.js";
import { PowerupSpeed } from "./powerup-speed.js";

// --------------------------------------------------------------------------------------------------

/** @type {number[][]} */
export let mapTemplate = []; // the map template
/** @type {number[][]} */
let map = []; // the map instance
/** @type {{row: number, col: number}[]} */
let playerSpawnPositions = [];
let headlessMode = true;

// --------------------------------------------------------------------------------------------------

export function reset() {
	world.clearData();
	if (!headlessMode) {
		world.getClient().reset();
	}
}

/**
 * @param {Client Module or null} client null to run in headless mode, or a valid client module to use as front-end.
 **/
export function init(client) {
	Entity.onEntityCreated.subscribe(handleEntityCreated);
	Entity.onEntityDestroyed.subscribe(handleEntityDestroyed);
	world.setOnBrickDestroyedCallback(handleBrickDestroyed);
	headlessMode = !client;

	if (client) {
		world.setClient(client);
		client.init();
	}

	reset();
}

/**
 * @param {number[][]} mapTemplate,
 * @param {number} playerSpawnSlot
 */
export function startGame(mapTemplate, playerSpawnSlot) {
	selectMap(mapTemplate);
	spawnEntities(playerSpawnSlot);
}

export function update(dt) {
	world.update(dt);
	if (!headlessMode) {
		world.getClient().update(dt);
	}
}

export function draw() {
	if (!headlessMode) {
		world.getClient().draw();
	}
}

/**
 * @param {number} slotId
 * @returns [x: number, y: number]
 */
export function getPlayerSpawnPosition(slotId) {
	return [
		playerSpawnPositions[slotId].col * constants.TILE_SIZE + constants.PLAYER_INITIAL_X_OFFS,
		playerSpawnPositions[slotId].row * constants.TILE_SIZE + constants.PLAYER_INITIAL_Y_OFFS
	];
}

// --------------------------------------------------------------------------------------------------

/** @param {number} playerSpawnSlot */
function spawnEntities(playerSpawnSlot) {
	playerSpawnPositions = [];
	let crtPlayerSlot = 0;
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
			if (map[i][j] <= 2) {
				continue; // brick type or empty
			}
			// some entity type
			switch (map[i][j]) {
				case 9: // player
					playerSpawnPositions.push({ row: i, col: j });
					if (playerSpawnSlot == crtPlayerSlot) {
						const playerX = j * constants.TILE_SIZE + constants.PLAYER_INITIAL_X_OFFS;
						const playerY = i * constants.TILE_SIZE + constants.PLAYER_INITIAL_Y_OFFS;
						world.handlePlayerSpawned(
							new Player({
								x: playerX,
								y: playerY,
								skinNumber: playerSpawnSlot
							})
						);
					}
					crtPlayerSlot++;
					break;
				default: // enemy
					const enemyX = j * constants.TILE_SIZE + constants.ENEMY_INITIAL_X_OFFS;
					const enemyY = i * constants.TILE_SIZE + constants.ENEMY_INITIAL_Y_OFFS;
					let enemyType = map[i][j] - 3;
					enemyType = 0; // TODO remove hardcoding after adding all the sprites
					world.handleEnemySpawned(
						new Enemy({
							x: enemyX,
							y: enemyY,
							type: enemyType
						})
					);
					break;
			}
			map[i][j] = 0; // leave an empty space below entity
		}
	}
	if (!headlessMode && !world.getClient().getPlayer()) {
		console.error(`Player spawn position #${playerSpawnSlot} not found in map!`);
	}
}

/** @param {number[][]} mapTemplate (Optional) the template to instantiate the map from; if missing, a random map will be generated */
function selectMap(template) {
	mapTemplate = template;
	// make a deep copy, so we don't ever alter the map template while playing
	map = mapTemplate.map(
		row => [...row]
	);

	world.setMap(map);
}

/** @param {Entity} entity */
function handleEntityCreated(entity) {
	world.addEntity(entity);
	if (!headlessMode) {
		world.getEntities().sort((a, b) => a.layer - b.layer);
	}
}

/** @param {Entity} entity */
function handleEntityDestroyed(entity) {
	world.removeEntity(entity);
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
