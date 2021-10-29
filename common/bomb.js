import * as constants from "./constants.js";
import { GridEntity } from "./grid-entity.js";
import * as world from "./world.js";
import { Character } from "./character.js";
import { Event } from "./event.js";

export class Bomb extends GridEntity {

	static ENTITY_TYPE = "bomb";

	onExplode = new Event();

	fuseTime = constants.BOMB_FUSE_TIME;
	power = 1;
	playerSlot = -1;

	/** @param {number} power the number of tiles the flames will span in each direction */
	constructor(power, row, column, playerSlot) {
		super(row, column);
		this.power = power;
		world.getEntitiesInArea(this.getBoundingBox()).forEach(
			entity => {
				if (entity instanceof Character) {
					entity.overlapingBombs.push(this);
				}
			}
		);
		this.startAnimation("idle");
		this.playerSlot = playerSlot;
	}

	/** @returns {string} the type of entity */
	getType() { return Bomb.ENTITY_TYPE; }

	/** @override @returns {EntityState} */
	buildStateData() {
		return {
			...super.buildStateData(),
			fuseTime: this.fuseTime
		};
	}

	/** @override @returns full data required to rebuild this object */
	serialize() {
		return {
			...super.serialize(),
			fuseTime: this.fuseTime,
			power: this.power
		};
	}

	/** @override */
	deserialize(data) {
		super.deserialize(data);
		this.fuseTime = data.fuseTime;
		this.power = data.power;
	}

	update(dt) {
		super.update(dt);
		this.fuseTime -= dt;
		if (this.fuseTime <= 0) {
			this.explode();
		}
	}

	explode() {
		this.onExplode.trigger(this);
		this.destroy();
	}

	/** @override we've been fried by another explosion, so chain-reaction! */
	fry(killerSlotId) {
		this.playerSlot = killerSlotId; // if this bomb was triggered by someone else, the frag should count toward him
		this.explode();
	}
}
