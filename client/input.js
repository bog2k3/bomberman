import { dosemu } from "../common/node_modules/dosemu/index.js";
import { clientState } from "./client-state.js";
import * as raycast  from "./raycast.js";
import * as editMode from "./edit-mode.js";

// --------------------------------------------------------------------------------------------------

let wasSpacePressed = false;

// --------------------------------------------------------------------------------------------------

export function getMouseRowCol() {
	const [mouseX, mouseY] = dosemu.getMousePosition();
	const mouseCol = Math.floor((mouseX + scrollX) / constants.TILE_SIZE);
	const mouseRow = Math.floor((mouseY + scrollY) / constants.TILE_SIZE);
	return [mouseRow, mouseCol];
}


export function update(dt) {
	if (!clientState.enable3DMode) {
		if (dosemu.isKeyPressed("ArrowDown")) {
			clientState.player.move("down");
		} else if (dosemu.isKeyPressed("ArrowUp")) {
			clientState.player.move("up");
		} else if (dosemu.isKeyPressed("ArrowLeft")) {
			clientState.player.move("left");
		} else if (dosemu.isKeyPressed("ArrowRight")) {
			clientState.player.move("right");
		}
	}
	if (dosemu.isKeyPressed(" ") && !wasSpacePressed) {
		clientState.player.spawnBomb();
		wasSpacePressed = true;
	}
	if (!dosemu.isKeyPressed(" ")) {
		wasSpacePressed = false;
	}
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
				if (editMode.ENABLED) {
					editMode.handleKey(key);
				}
		}
	});
	dosemu.onMouseDown((x, y, btn) => {
		if (btn === 2) {
			editMode.nextEditTileType();
		}
	})
}

// --------------------------------------------------------------------------------------------------

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
	registerCommandHandlers();
})();
