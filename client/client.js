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
import { Bomb } from "../common/bomb.js";
import { Fire } from "../common/fire.js";
import { PowerupBomb } from "../common/powerup-bomb.js";
import { PowerupRadius } from "../common/powerup-radius.js";
import { PowerupSpeed } from "../common/powerup-speed.js";
import { Character } from "../common/character.js";

// --------------------------------------------------------------------------------------------------

export function init() {
	raycast.init();
	Entity.onEntityDestroyed.subscribe(handleEntityDestroyed);
	input.onPlayerRespawnKeyPressed(respawnPlayer);

	socket.onNetworkPlayerSpawned(handleNetworkPlayerSpawned);
	socket.onNetworkPlayerInput(handleNetworkPlayerInput);
	socket.onStateUpdate(handleStateUpdate);
	socket.onEntityCreated(handleEntityCreated);
	socket.onEntityRemoved(handleEntityRemoved);
	socket.onBrickDestroyed(handleBrickDestroyed);
	socket.onLiveEntityData(handleLiveEntityData);
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
	handleCharacterSpawned(player);
	socket.sendPlayerSpanwed(player.skinNumber, player.uuid) // because skin number is equivalent with spawn slot or player id
		.then(() => {
			player.setInputController(clientState.playerInputController);
		});
}

/** @param {Character} character */
export function handleCharacterSpawned(character) {
	character.onDestroy.subscribe(
		() => createCharacterExplodeAnimation(character.getType(), character.x, character.y)
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
	handleCharacterSpawned(networkPlayer);
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

function handleNetworkPlayerSpawned({slot, uuid, nickname}) {
	if (slot !== clientState.player.skinNumber) {
		spawnNetworkPlayer(slot, uuid, nickname);
	}
}

/** @param {{event: "key-pressed" | "key-released", key: string, playerSlot: number}} event */
function handleNetworkPlayerInput(event) {
	if (event.playerSlot !== clientState.player.skinNumber) {
		clientState.networkInputControllers[event.playerSlot].inputSource.setKeyStatus(
			event.key, event.event == "key-pressed"
		);
	}
}

/** @type {{[entityId: string]: EntityState}} stateData */
function handleStateUpdate(stateData) {
	for (let e of world.getEntities()) {
		if (stateData[e.uuid]) {
			e.updateFromStateData(stateData[e.uuid]);
		}
	}
	clientState.scores = stateData["scores"];
}

function handleEntityCreated(data, allowPlayers) {
	switch (data._entityType) {
		case Bomb.ENTITY_TYPE:
			return (new Bomb(0, 0, 0)).deserialize(data);
		case Fire.ENTITY_TYPE:
			return (new Fire("", 0, 0)).deserialize(data);
		case PowerupBomb.ENTITY_TYPE:
			return (new PowerupBomb(0, 0)).deserialize(data);
		case PowerupRadius.ENTITY_TYPE:
			return (new PowerupRadius(0, 0)).deserialize(data);
		case PowerupSpeed.ENTITY_TYPE:
			return (new PowerupSpeed(0, 0)).deserialize(data);
		default:
			if (data._entityType.startsWith(Player.ENTITY_TYPE)) {
				if (allowPlayers) {
					handleNetworkPlayerSpawned({
						nickname: data.name,
						slot: data.skinNumber,
						uuid: data.uuid
					});
				} else {
					// this shouldn't happen since players are handled by a different mechanism
					console.error(`received PLAYER from server on ENTITY_ADDED`);
				}
			} else if (data._entityType.startsWith(Enemy.ENTITY_TYPE)) {
				const enemy = new Enemy({});
				enemy.deserialize(data);
				return handleCharacterSpawned(enemy);
			} else {
				console.error(`received unknown entity type from server on ENTITY_ADDED: "${data._entityType}".`);
			}
	}
}

function handleEntityRemoved(uuid) {
	world.getEntities()
		.filter(e => e.uuid === uuid)
		.forEach(
			e => e.destroy()
		);
}

function handleBrickDestroyed({row, column}) {
	world.destroyBrick(row, column);
}

/** @param {any[]} data */
function handleLiveEntityData(data) {
	for (let element of data) {
		handleEntityCreated(element, true);
	}
}
