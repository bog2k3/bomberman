import { InputSource } from "../common/input-source.js";
import { Player } from "../common/player.js";

export const clientState = {
	enable3DMode: false,

	/** @type {Player} */
	player: null,
	playerHasDied: false,

	scrollX: 0,
	scrollY: 0,

	/** @type {{[slotId: number]: InputSource}} */
	networkInputSources: {}
}
