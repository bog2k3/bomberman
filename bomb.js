import { dosemuSprite } from "./node_modules/dosemu/index.js";
import { bombSprites } from "./bomb-sprites.js";
import * as constants from "./constants.js";
import { GridEntity } from "./grid-entity.js";
import { Fire } from "./fire.js";
import * as world from "./world.js";

export class Bomb extends GridEntity {

	animationFrame = 0;
	fuseTime = constants.BOMB_FUSE_TIME;
	power = 1;

	/** @param {number} power the number of tiles the flames will span in each direction */
	constructor(power, row, column) {
		super(row, column);
		this.power = power;
	}

	/** @returns {string} the type of entity */
	getType() { return "bomb"; }

	/** @returns {dosemuSprite.Sprite} the current sprite to use for drawing */
	getCurrentSprite() {
		return bombSprites.frames[Math.floor(this.animationFrame) % bombSprites.frames.length];
	}

	update(dt) {
		this.animationFrame += bombSprites.animationSpeed * dt;
		this.fuseTime -= dt;
		if (this.fuseTime <= 0) {
			this.explode();
		}
	}

	explode() {
		this.destroy();
		// create central fire
		new Fire("center", this.row, this.column)
		// go out from the center and create the flames
		let directions = {
			Up: { blocked: false, dx: 0, dy: -1 },
			Down: { blocked: false, dx: 0, dy: 1 },
			Left: { blocked: false, dx: -1, dy: 0 },
			Right: { blocked: false, dx: 1, dy: 0 },
		};
		for (let i=0; i<this.power; i++) {
			for (let dirKey in directions) {
				const dir = directions[dirKey];
				if (dir.blocked) {
					continue;
				}
				const fRow = this.row + dir.dy * (i+1);
				const fColumn = this.column + dir.dx * (i+1);
				const cellType = world.getMapCell(fRow, fColumn);
				if ([-1, 2].includes(cellType)) {
					// we got outside of map or hit an indestructible brick
					dir.blocked = true;
					continue;
				}
				// spawn the right type of fire
				const isCap = i === this.power-1 || cellType === 1;
				const fireType = isCap ? `cap${dirKey}` : (
					["Up", "Down"].includes(dirKey) ? "middleV" : "middleH"
				);
				new Fire(fireType, fRow, fColumn);
				// if we hit a regular brick, we stop here and destroy the brick
				if (cellType === 1) {
					dir.blocked = true;
					world.setMapCell(fRow, fColumn, 0);
				}
			}
		}
	}

	/** we've been fried by another explosion, so chain-reaction! */
	fry() {
		this.explode();
	}
}
