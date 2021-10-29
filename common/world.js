import { dosemuBBox } from "./node_modules/dosemu/index.js";
import * as collision from "./collision.js";
import { Entity } from "./entity.js";
import * as constants from "./constants.js";
import { Event } from "./event.js";

// --------------------------------------------------------------------------------------------------

const data = {
	/** @type {number[][]} */
	map: [],
	/** @type {Entity[]} */
	entities: [],

	/** @type {dynamically imported client module (or null in headless mode)} */
	client: null
};

/** @param {Entity} entity the newly added entity */
export const onEntityAdded = new Event();
/** @param {Entity} entity the newly added entity */
export const onEntityRemoved = new Event();
/** @param {(row: number, col: number) => void} */
export const onBrickDestroyed = new Event();

// --------------------------------------------------------------------------------------------------

/** @param {number[][]} map */
export function setMap(map) {
	data.map = map;
	collision.setMap(map);
}

/** @returns {number[][]} */
export function getMap() {
	return data.map;
}

/** @param {Entity} entity */
export function addEntity(entity) {
	data.entities.push(entity);
	collision.addEntity(entity);
	onEntityAdded.trigger(entity);
}

/** @param {Entity} entity */
export function removeEntity(entity) {
	data.entities.splice(data.entities.indexOf(entity), 1);
	collision.removeEntity(entity);
	onEntityRemoved.trigger(entity);
}

/** @returns {Entity[]} */
export function getEntities() {
	return data.entities;
}

export function clearData() {
	data.map = [];
	data.entities = [];
	collision.clearData();
}

/** @param {number} dt */
export function update(dt) {
	data.entities.forEach(e => e.update(dt));
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

export function destroyBrick(row, col) {
	if (getMapCell(row, col) === 1) {
		setMapCell(row, col, 0);
		onBrickDestroyed.trigger(row, col);
	}
}

export function setClient(client) {
	data.client = client;
}

export function getClient() {
	return data.client;
}

/** @param {Entity} player */
export function handlePlayerSpawned(player) {
	if (data.client) {
		data.client.handlePlayerSpawned(player);
	}
}

/** @param {Entity} enemy */
export function handleCharacterSpawned(enemy) {
	if (data.client) {
		data.client.handleCharacterSpawned(enemy);
	}
}
