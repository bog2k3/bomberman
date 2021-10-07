import { Entity } from "./entity.js";
import { dosemuBBox } from "./node_modules/dosemu/index.js";
import * as constants from "./constants.js";
import { clamp } from "./math.js";

export class CollisionResult {
	/** @type {{row: number, column: number, type: number}|null} */
	brick = null;
	/** @type {Entity | null} */
	entity = null;
}

/** @type {{map: number[][], entities: Entity[]}} */
const data = {
	map: [],
	entities: []
};

/**
 * Checks if the given bounding box collides with anything
 * @param {dosemuBBox.BoundingBox} boundingBox a world-space bounding box to check against the world
 * @param {Entity} owner the owner of the bounding box; this is required in order to ignore collisions with self
 * @returns {CollisionResult|null} null if there's no collision, or a CollisionResult object
 * */
export function checkCollision(boundingBox, owner) {
	// step 1: check against bricks
	const rowStart = clamp(Math.floor(boundingBox.up / constants.TILE_SIZE), 0, data.map.length-1);
	const rowEnd = clamp(Math.floor(boundingBox.down / constants.TILE_SIZE), 0, data.map.length-1);
	const colStart = clamp(Math.floor(boundingBox.left / constants.TILE_SIZE), 0, data.map[0].length-1);
	const colEnd = clamp(Math.floor(boundingBox.right / constants.TILE_SIZE), 0, data.map[0].length-1);
	for (let row=rowStart; row<=rowEnd; row++) {
		for (let col=colStart; col<=colEnd; col++) {
			if ([1,2].includes(data.map[row][col])) {
				return {
					brick: {row: row, column: col, type: data.map[row][col]}
				};
			}
		}
	}
	// step 2: check against other entities
	for (let entity of data.entities) {
		if (entity !== owner && dosemuBBox.getBoundingBoxOverlap(boundingBox, entity.getBoundingBox())) {
			return {
				entity
			};
		}
	}
	return null;
}

/** @param {number[][]} map */
export function setMap(map) {
	data.map = map;
}

/** @param {Entity} entity */
export function addEntity(entity) {
	data.entities.push(entity);
}

/** @param {Entity} entity */
export function removeEntity(entity) {
	data.entities.splice(data.entities.indexOf(entity), 1);
}

export function clearData() {
	data.map = [];
	data.entities = [];
}
