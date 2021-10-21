import { dosemu } from "../common/node_modules/dosemu/index.js";
import { clientState } from "./client-state.js";
import * as raycast  from "./raycast.js";
import * as editMode from "./edit-mode.js";
import * as socket from "./socket.js";
import { InputSource } from "../common/input-source.js";

// --------------------------------------------------------------------------------------------------

export const localInputSource = new InputSource();

// --------------------------------------------------------------------------------------------------

export function getMouseRowCol() {
	const [mouseX, mouseY] = dosemu.getMousePosition();
	const mouseCol = Math.floor((mouseX + scrollX) / constants.TILE_SIZE);
	const mouseRow = Math.floor((mouseY + scrollY) / constants.TILE_SIZE);
	return [mouseRow, mouseCol];
}

// --------------------------------------------------------------------------------------------------

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
		raycast.updatePlayerAngle(player);
	}
}

function toggleEditMode() {
	editMode.ENABLED = !editMode.ENABLED;
	clientState.enable3DMode = false;
	if (editMode.ENABLED) {
		dosemu.showMouse();
		map = mapTemplate; // operate on the template directly while editing
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
