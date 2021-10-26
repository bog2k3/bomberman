import { dosemu } from "../common/node_modules/dosemu/index.js";
import { clientState } from "./client-state.js";
import * as raycast  from "./raycast.js";
import * as editMode from "./edit-mode.js";
import * as socket from "./socket.js";
import * as bomberman from "../common/bomberman.js";
import { InputSource } from "../common/input-source.js";

// --------------------------------------------------------------------------------------------------

export const localInputSource = new InputSource();

// --------------------------------------------------------------------------------------------------

/** @param {() => void} callback */
export function onPlayerRespawnKeyPressed(callback) {
	playerRespawnKeyPressedCallback = callback;
}

// --------------------------------------------------------------------------------------------------

/** @type {() => void} callback to invoke when the player is dead and the respawn key was pressed. */
let playerRespawnKeyPressedCallback = null;

function isPlayerControlKey(key) {
	return [
		"ArrowLeft",
		"ArrowRight",
		"ArrowUp",
		"ArrowDown",
		" "
	].includes(key);
}

function registerKeyboardEventHandlers() {
	dosemu.onKeyDown((key) => {
		switch (key) {
			case "q":
				toggleEditMode();
				break;
			case "e":
				toggle3dMode();
				break;
			case "Enter":
				if (clientState.playerHasDied && playerRespawnKeyPressedCallback) {
					playerRespawnKeyPressedCallback();
					if (clientState.enable3DMode) {
						raycast.updatePlayerAngle(clientState.player);
					}
				}
			default:
				if (editMode.ENABLED) {
					editMode.handleKey(key);
				} else {
					if (isPlayerControlKey(key)) {
						if (!clientState.enable3DMode) {
							localInputSource.setKeyStatus(key, true);
						}
						notifyServer({
							event: "key-pressed",
							key
						});
					}
				}
		}
	});
	dosemu.onKeyUp((key) => {
		if (!editMode.ENABLED && isPlayerControlKey(key)) {
			localInputSource.setKeyStatus(key, false);
			notifyServer({
				event: "key-released",
				key
			});
		}
	})
	dosemu.onMouseDown((x, y, btn) => {
		if (btn === 2) {
			editMode.nextEditTileType();
		}
	})
}

/** @param {{event: "key-pressed" | "key-released", key: string}} event */
function notifyServer(event) {
	socket.sendPlayerKeyEvent(event);
}

function toggle3dMode() {
	clientState.enable3DMode = !clientState.enable3DMode;
	if (clientState.enable3DMode) {
		raycast.updatePlayerAngle(clientState.player);
	}
}

function toggleEditMode() {
	editMode.setEnabled(!editMode.ENABLED);
	clientState.enable3DMode = false;
	if (editMode.ENABLED) {
		dosemu.showMouse();
		editMode.setMap(bomberman.mapTemplate);
	} else {
		dosemu.hideMouse();
		editMode.writeMapToConsole();
		// TODO: perhaps send the map to server and update for all players? or perhaps do it real-time?
		// reset();
		// selectMap(mapTemplate);
	}
}

(function init() {
	registerKeyboardEventHandlers();
})();
