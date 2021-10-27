import * as raycast from "./raycast.js";
import * as bombermanDraw from "./draw.js";
import * as editMode from "./edit-mode.js";
import * as input from "./input.js";
import * as socket from "./socket.js";
import * as bomberman from "../common/bomberman.js";
import { clientState } from "./client-state.js";
import { Player } from "../common/player.js";
import { CharacterExplodeAnimation } from "./character-explode-animation.js";
import { Entity } from "../common/entity.js";
import { InputSource } from "../common/input-source.js";
import { Enemy } from "../common/enemy.js";

// --------------------------------------------------------------------------------------------------

export function init() {
	raycast.init();
	Entity.onEntityDestroyed.subscribe(handleEntityDestroyed);
	input.onPlayerRespawnKeyPressed(respawnPlayer);

	socket.onNetworkPlayerSpawned().subscribe((slotId) => {
		// spawnNetworkPlayer(slotId);
		// TODO this arrives too early, must wait until map is processed and entities are spawned
	});

	socket.onNetworkPlayerInput().subscribe(
		/** @param {{playerId: number, key: string, status: boolean}} event */
		(event) => {
			clientState.networkInputSources[event.playerId].setKeyStatus(
				event.key, event.status
			);
		}
	)
}

export function reset() {
	clientState.player = null;
	clientState.playerHasDied = false;
}

export function draw() {
	if (editMode.ENABLED) {
		editMode.draw();
	} else {
		bombermanDraw.draw();
	}
}

export function update(dt) {
	if (editMode.ENABLED) {
		editMode.update(dt);
	} else if (clientState.enable3DMode) {
		raycast.update(clientState.player, dt);
	}
}

/** @param {Player} player */
export function handlePlayerSpawned(player) {
	clientState.player = player;
	player.setInputController(clientState.playerInputController);
	player.onDestroy.subscribe(
		() => createCharacterExplodeAnimation(player.getType(), player.x, player.y)
	);
	socket.sendPlayerSpanwed(player.skinNumber); // because skin number is equivalent with spawn slot or player id
}

/** @param {Enemy} enemy */
export function handleEnemySpawned(enemy) {
	enemy.onDestroy.subscribe(
		() => createCharacterExplodeAnimation(enemy.getType(), enemy.x, enemy.y)
	);
}

/** @returns {Player} */
export function getPlayer() {
	return clientState.player;
}

// --------------------------------------------------------------------------------------------------

/** @param {Entity} entity */
function handleEntityDestroyed(entity) {
	if (entity === clientState.player) {
		// player was destroyed, we wait for the explode animation to finish
		setTimeout(() => {
			clientState.playerHasDied = true;
		}, 1500);
	}
}

function spawnNetworkPlayer(slotId) {
	const [x, y] = bomberman.getPlayerSpawnPosition(slotId);
	const networkPlayer = new Player({
		x, y,
		skinNumber: slotId
	});
	networkPlayer.setInputSource(createNetworkInputSource(slotId));
}

function createNetworkInputSource(slotId) {
	clientState.networkInputSources[slotId] =  new InputSource();
	return clientState.networkInputSources[slotId];
}

function respawnPlayer() {
	const [x, y] = bomberman.getPlayerSpawnPosition(clientState.player.skinNumber);
	handlePlayerSpawned(clientState.player.respawn(x, y));
	clientState.playerHasDied = false;
}

/** @param {"player-n" | "enemy-n"} type the type of animation to create, where "n" is the skin number */
function createCharacterExplodeAnimation(type, x, y) {
	new CharacterExplodeAnimation(x, y, type)
}
