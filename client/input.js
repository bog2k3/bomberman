
export function getMouseRowCol() {
	const [mouseX, mouseY] = dosemu.getMousePosition();
	const mouseCol = Math.floor((mouseX + scrollX) / constants.TILE_SIZE);
	const mouseRow = Math.floor((mouseY + scrollY) / constants.TILE_SIZE);
	return [mouseRow, mouseCol];
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
				if (EDIT_MODE) {
					handleEditModeKey(key);
				}
		}
	});
	dosemu.onMouseDown((x, y, btn) => {
		if (btn === 2) {
			nextEditTileType();
		}
	})
}

function toggle3dMode() {
	enable3DMode = !enable3DMode;
	player.movementInputEnabled = !enable3DMode;
	if (enable3DMode) {
		raycast.updatePlayerAngle(player);
	}
}

function toggleEditMode() {
	EDIT_MODE = !EDIT_MODE;
	enable3DMode = false;
	if (EDIT_MODE) {
		dosemu.showMouse();
		map = mapTemplate; // operate on the template directly while editing
	} else {
		dosemu.hideMouse();
		writeMapToConsole();
		reset();
		selectMap(mapTemplate);
	}
}
