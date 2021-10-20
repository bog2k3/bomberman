import * as raycast from "./raycast.js";
import * as bombermanDraw from "./draw.js";
import * as editMode from "./edit-mode.js";
import * as input from "./input.js";
import { clientState } from "./client-state.js";
import { Player } from "../common/player.js";
import { CharacterExplodeAnimation } from "./character-explode-animation.js";
import { Entity } from "../common/entity.js";

// --------------------------------------------------------------------------------------------------

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
	input.update(dt);
}

/** @param {Player} player */
export function setPlayer(player) {
	clientState.player = player;
}

/** @returns {Player} */
export function getPlayer() {
	return clientState.player;
}

/** @param {"player-n" | "enemy-n"} type the type of animation to create, where "n" is the skin number */
export function createCharacterExplodeAnimation(type, x, y) {
	new CharacterExplodeAnimation(x, y, type)
}

// --------------------------------------------------------------------------------------------------

/** @param {Entity} entity */
function handleEntityDestroyed(entity) {
	if (entity === clientState.player) {
		// player was destroyed, we wait for the explode animation to finish
		setTimeout(() => {
			// TODO respawn or whatever
			clientState.playerHasDied = true;
		}, 1500);
	}
}

// --------------------------------------------------------------------------------------------------

(function init() {
	raycast.init();
	Entity.onEntityDestroyed.subscribe(handleEntityDestroyed);
})();
