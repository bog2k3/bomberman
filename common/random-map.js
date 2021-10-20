import * as constants from "../common/constants.js";

/**
 * Generates and returns a random map
 * @param {number} nRows number of rows for the map
 * @param {number} nCols number of columns
 */
 export function generateRandomMap(nRows, nCols) {
	let theMap = [];
	// create empty map:
	for (let i=0; i<nRows; i++) {
		theMap.push([]);
		for (let j=0; j<nCols; j++) {
			theMap[i][j] = 0;
		}
	}
	// top and bottom borders:
	for (let i=0; i<nCols; i++) {
		theMap[0][i] = 2;
		theMap[nRows-1][i] = 2;
	}
	// left and right borders:
	for (let i=0; i<nRows; i++) {
		theMap[i][0] = 2;
		theMap[i][nCols-1] = 2;
	}
	const fillFactor = constants.RANDOM_MAP_FILL_FACTOR_MIN + (constants.RANDOM_MAP_FILL_FACTOR_MAX - constants.RANDOM_MAP_FILL_FACTOR_MIN) * Math.random();
	// destructable bricks:
	for (let i=1; i<nRows-1; i++) {
		for (let j=1; j<nCols-1; j++) {
			if (i%2===0 && j%2===0) {
				theMap[i][j] = 2;
			} else {
				if (Math.random() < fillFactor) {
					theMap[i][j] = 1;
				}
			}
		}
	}
	// player spawn positions:
	const halfRow = Math.floor(nRows/2);
	const halfCol = Math.floor(nCols/2);
	const playerSpawnPositions = [
		[1, 1],
		[1, nCols-2],
		[nRows-2, 1],
		[nRows-2, nCols-2],
		[halfRow, halfCol],
		[1, halfCol],
		[nRows-2,halfCol]
	];
	for (let pos of playerSpawnPositions) {
		const row = pos[0], col = pos[1];
		if (theMap[row, col] === 2) {
			// we landed on an indestructable brick, shift the position
			if (col <= halfCol) {
				col++;
			} else {
				col--;
			}
		}
		pos[0] = row; // update the altered position in the array since we'll use them later
		pos[1] = col;
		theMap[row][col] = 9;
		// make some room around
		if (theMap[row-1][col] === 1) {
			theMap[row-1][col] = 0;
		}
		if (theMap[row+1][col] === 1) {
			theMap[row+1][col] = 0;
		}
		if (theMap[row][col-1] === 1) {
			theMap[row][col-1] = 0;
		}
		if (theMap[row][col+1] === 1) {
			theMap[row][col+1] = 0;
		}
	}
	// create some enemies:
	let enemyCount = Math.floor(nRows * nCols * constants.RANDOM_MAP_ENEMY_DENSITY);
	const enemySpawnPositions = [];
	while (enemyCount > 0) {
		let foundSuitablePosition = false;
		let nTries = 0;
		while (!foundSuitablePosition && nTries < 20) {
			let row = Math.floor(Math.random() * nRows);
			let col = Math.floor(Math.random() * nCols);
			if (isValidPositionForEnemy(row, col, theMap, playerSpawnPositions, enemySpawnPositions)) {
				foundSuitablePosition = true;
				theMap[row][col] = 3;
				enemySpawnPositions.push([row, col]);
				enemyCount--;
			} else {
				nTries++;
			}
		}
		if (!foundSuitablePosition) {
			enemyCount = 0; // we can't place any more enemies
		}
	}
	return theMap;
}

function isValidPositionForEnemy(row, col, map, playerSpawnPos, enemySpawnPositions) {
	// valid positions for an enemy are at sufficient manhattan distance from a player spawn pos and all other enemies
	// and are not on indestructable bricks
	const minDistance = 4;
	if (map[row][col] === 2) {
		return false;
	}
	for (let spawnPos of [...playerSpawnPos, ...enemySpawnPositions]) {
		const dist = Math.abs(spawnPos[0] - row) + Math.abs(spawnPos[1] - col);
		if (dist < minDistance) {
			return false;
		}
	}
	return true;
}
