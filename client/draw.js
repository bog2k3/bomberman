
export function draw() {
	if (!EDIT_MODE) {
		[scrollX, scrollY] = getScrollOffsets();
	}

	if (!EDIT_MODE && enable3DMode) {
		draw3D();
	} else {
		draw2D();
	}
	if (!EDIT_MODE && playerHasDied) {
		drawLoserBox();
	}
}

function draw2D() {
	// on which tile we start drawing:
	const tileOffsX = clamp(Math.floor(scrollX / constants.TILE_SIZE), 0, map[0].length - 1);
	const tileOffsY = clamp(Math.floor(scrollY / constants.TILE_SIZE), 0, map.length - 1);
	// how many tiles to draw:
	const nTilesX = Math.min(Math.ceil(constants.SCREEN_WIDTH / constants.TILE_SIZE) + 1, map[0].length - tileOffsX);
	const nTilesY = Math.min(Math.ceil(constants.SCREEN_HEIGHT / constants.TILE_SIZE) + 1, map.length - tileOffsY);

	// draw field (background):
	for (let i = tileOffsY; i < map.length && i < tileOffsY + nTilesY; i++) {
		for (let j = tileOffsX; j < map[0].length && j < tileOffsX + nTilesX; j++) {
			if (map[i][j] === 0) {
				drawTile(i, j, -scrollX, -scrollY);
			}
		}
	}

	const entities = world.getEntities();

	// draw entities below layer 0:
	let iEntity = 0;
	if (!EDIT_MODE) {
		while (iEntity < entities.length && entities[iEntity].layer < 0) {
			entities[iEntity].draw(-scrollX, -scrollY);
			iEntity++;
		}
	}

	// draw bricks (layer 0):
	for (let i = tileOffsY; i < map.length && i < tileOffsY + nTilesY; i++) {
		for (let j = tileOffsX; j < map[0].length && j < tileOffsX + nTilesX; j++) {
			if (map[i][j] !== 0) {
				drawTile(i, j, -scrollX, -scrollY);
			}
		}
	}

	if (!EDIT_MODE) {
		// draw entities above layer 0:
		while (iEntity < entities.length) {
			entities[iEntity].draw(-scrollX, -scrollY);
			iEntity++;
		}
	}

	if (EDIT_MODE) {
		drawEditModeOverlay(tileOffsX, tileOffsY, nTilesX, nTilesY);
	}
}

function drawTile(row, col, mapDX, mapDY) {
	const tileX = col * constants.TILE_SIZE + mapDX;
	const tileY = row * constants.TILE_SIZE + mapDY;
	let sprite = null;
	if ([1, 2].includes(map[row][col])) {
		// brick type
		sprite = themes[selectedTheme].brickSprites[map[row][col] - 1];
	} else {
		// if the map is 0 or a non-brick value (enemy or player), we draw a field sprite at that location
		sprite = themes[selectedTheme].fieldSprite;
	}
	dosemu.drawSprite(tileX, tileY, sprite);
}

function drawLoserBox() {
	dosemu.drawBar(70, 85, 245, 115, 0);
	dosemu.drawRectangle(70, 85, 245, 115, 9);
	dosemu.drawRectangle(68, 83, 247, 117, 0);
	dosemu.drawText(160, 100, "You're dead! Loser!", 9, "center");
}


function draw3D() {
	raycast.render(map, player, world.getEntities(), themes[selectedTheme]);
}

/** @returns {[ofsX: number, ofsY: number]} */
function getScrollOffsets() {
	// start from the last scroll position
	let viewportX = scrollX;
	let viewportY = scrollY;
	// only adjust if the player moves outside a central region
	const playerScreenX = player.x - scrollX;
	const playerScreenY = player.y - scrollY;
	const toleranceX = constants.SCREEN_WIDTH / 8;
	const toleranceY = constants.SCREEN_HEIGHT / 8;
	const centerX = constants.SCREEN_WIDTH / 2;
	const centerY = constants.SCREEN_HEIGHT / 2;
	const differenceX = playerScreenX - centerX;
	const differenceY = playerScreenY - centerY;
	if (Math.abs(differenceX) > toleranceX) {
		viewportX += differenceX - toleranceX * Math.sign(differenceX);
	}
	if (Math.abs(differenceY) > toleranceY) {
		viewportY += differenceY - toleranceY * Math.sign(differenceY);
	}
	// only scroll as much as the map limits
	viewportX = clamp(viewportX, 0, maxMapX - constants.SCREEN_WIDTH);
	viewportY = clamp(viewportY, 0, maxMapY - constants.SCREEN_HEIGHT);

	return [viewportX, viewportY];
}
