import * as raycast from "../client/raycast.js";
import * as bombermanDraw from "./draw.js";
import * as editMode from "./edit-mode.js";
import { clientState } from "./client-state.js";
import { Player } from "../common/player.js";

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
}

/** @param {Player} player */
export function setPlayer(player) {
	clientState.player = player;
}

/** @returns {Player} */
export function getPlayer() {
	return clientState.player;
}

// --------------------------------------------------------------------------------------------------

(function init() {
	raycast.init();
	// registerCommandHandlers();
})();
