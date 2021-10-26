import * as input from "./input.js";
import { InputController } from "../common/input-controller.js";
import { Player } from "../common/player.js";

export const clientState = {
	enable3DMode: false,

	/** @type {Player} */
	player: null,
	playerInputController: new InputController(input.localInputSource),
	playerHasDied: false,

	scrollX: 0,
	scrollY: 0,

	/** @type {{[slotId: number]: input.InputSource}} */
	networkInputSources: {}
}
