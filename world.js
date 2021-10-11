import { dosemuBBox } from "./node_modules/dosemu/index.js";
import * as collision from "./collision.js";
import { Entity } from "./entity.js";
import * as constants from "./constants.js";

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

/**
 * @returns a list of entities that overlap the given bounding box (expressed in world space)
 * @param {dosemuBBox.BoundingBox} bbox
 */
export function getEntitiesInArea(bbox) {
	const result = [];
	for (let entity of data.entities) {
		if (dosemuBBox.getBoundingBoxOverlap(bbox, entity.getBoundingBox())) {
			result.push(entity);
		}
	}
	return result;
}

/**
 * @returns a list of entities that overlap the given cell
 */
export function getEntitiesInCell(row, col) {
	const bbox = new dosemuBBox.BoundingBox();
	bbox.up = row * constants.TILE_SIZE;
	bbox.down = bbox.up + constants.TILE_SIZE - 1;
	bbox.left = col * constants.TILE_SIZE;
	bbox.right = bbox.left + constants.TILE_SIZE - 1;
	return getEntitiesInArea(bbox);
}
