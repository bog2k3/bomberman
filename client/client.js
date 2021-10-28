import * as raycast from "./raycast.js";
import * as bombermanDraw from "./draw.js";
import * as editMode from "./edit-mode.js";
import * as input from "./input.js";
import * as socket from "./socket.js";
import * as bomberman from "../common/bomberman.js";
import * as world from "../common/world.js";
import { clientState } from "./client-state.js";
import { Player } from "../common/player.js";
import { CharacterExplodeAnimation } from "./character-explode-animation.js";
import { Entity } from "../common/entity.js";
import { InputSource } from "../common/input-source.js";
import { Enemy } from "../common/enemy.js";
import { InputController } from "../common/input-controller.js";

// --------------------------------------------------------------------------------------------------

export function init() {
	raycast.init();
	Entity.onEntityDestroyed.subscribe(handleEntityDestroyed);
	input.onPlayerRespawnKeyPressed(respawnPlayer);

	socket.onNetworkPlayerSpawned(({slot, uuid, nickname}) => {
		if (slot !== clientState.player.skinNumber) {
			spawnNetworkPlayer(slot, uuid, nickname);
		}
	});

	socket.onNetworkPlayerInput(
		/** @param {{event: "key-pressed" | "key-released", key: string, playerSlot: number}} event */
		(event) => {
			if (event.playerSlot !== clientState.player.skinNumber) {
				clientState.networkInputControllers[event.playerSlot].inputSource.setKeyStatus(
					event.key, event.event == "key-pressed"
				);
			}
		}
	);

	socket.onStateUpdate(handleStateUpdate);
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
export async function handlePlayerSpawned(player) {
	clientState.player = player;
	player.onDestroy.subscribe(
		() => createCharacterExplodeAnimation(player.getType(), player.x, player.y)
	);
	socket.sendPlayerSpanwed(player.skinNumber, player.uuid) // because skin number is equivalent with spawn slot or player id
		.then(() => {
			player.setInputController(clientState.playerInputController);
		});
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

/**
 * @param {number} slot
 * @param {string} uuid
 * @param {string} nickname
 */
function spawnNetworkPlayer(slot, uuid, nickname) {
	const [x, y] = bomberman.getPlayerSpawnPosition(slot);
	const networkPlayer = new Player({
		x, y,
		skinNumber: slot,
		name: nickname,
		uuid
	});
	networkPlayer.setInputController(createNetworkInputController(slot));
}

function createNetworkInputController(slotId) {
	clientState.networkInputControllers[slotId] = new InputController(new InputSource());
	return clientState.networkInputControllers[slotId];
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

/** @type {{[entityId: string]: EntityState}} stateData */
function handleStateUpdate(stateData) {
	for (let e of world.getEntities()) {
		if (stateData[e.uuid]) {
			e.updateFromStateData(stateData[e.uuid]);
		}
	}
}
