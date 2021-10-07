import * as collision from "./collision.js";

/** @type {{map: number[][], entities: Entity[]}} */
const data = {
	map: [],
	entities: []
};

/** @param {number[][]} map */
export function setMap(map) {
	data.map = map;
	collision.setMap(map);
}

/** @param {Entity} entity */
export function addEntity(entity) {
	data.entities.push(entity);
	collision.addEntity(entity);
}

/** @param {Entity} entity */
export function removeEntity(entity) {
	data.entities.splice(data.entities.indexOf(entity), 1);
	collision.removeEntity(entity);
}

export function clearData() {
	data.map = [];
	data.entities = [];
	collision.clearData();
}

/**
 * @returns {boolean} true if there's a bomb at the indicated position
 * @param {boolean} row
 * @param {boolean} column
 */
 export function isBombAt(row, column) {
	for (let entity of data.entities) {
		if (entity.getType() === "bomb" && entity.row === row && entity.column === column) {
			return true;
		}
	}
	return false;
}

export function getMapCell(row, column) {
	if (row < 0 || row >= data.map.length || column < 0 || column >= data.map[0].length) {
		return -1;
	}
	return data.map[row][column];
}

export function setMapCell(row, column, value) {
	if (row < 0 || row >= data.map.length || column < 0 || column >= data.map[0].length || value < 0 || value >= 9) {
		return;
	}
	data.map[row][column] = value;
}
