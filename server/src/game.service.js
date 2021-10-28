import * as bomberman from "../../common/bomberman.js";
import * as constants from "../../common/constants.js";
import * as world from "../../common/world.js";
import { InputController } from "../../common/input-controller.js";
import { InputSource } from "../../common/input-source.js";
import { Player } from "../../common/player.js";
import { generateRandomMap } from "../../common/random-map.js";
import { SocketService } from "./socket/socket.service.js";
import { EntityState } from "../../common/entity-state.js";
export class GameService {

	UPDATE_FREQ_HZ = 50; // 50 times per second
	STATE_UPDATE_FREQ_HZ = 10; // 10 times per second
	lastTime = new Date();
	lastStateUpdateTime = new Date();
	/** @type {SocketService} */
	socketService = null;
	/** @type {{[slotId: number]: InputController}} */
	inputControllers = {};
	updateInterval = null;

	/** @param {SocketService} socketService */
	constructor(socketService) {
		this.socketService = socketService;
		this.socketService.onPlayerSpawned = this.handlePlayerSpawned.bind(this);
		this.socketService.onPlayerInput = this.handlePlayerInput.bind(this);
	}

	initialize() {
		bomberman.init(null);
	}

	startRound() {
		const map = generateRandomMap(constants.DEFAULT_MAP_ROWS, constants.DEFAULT_MAP_COLS);
		bomberman.reset();
		bomberman.selectMap(map);
		bomberman.startGame(null);
		this.socketService.broadcastStartRound(map);
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
		}
	}

	startGame() {
		this.lastTime = new Date();
		this.lastStateUpdateTime = new Date();
		this.updateInterval = setInterval(() => this.update(), 1000 / this.UPDATE_FREQ_HZ);
		this.socketService.broadcastStartGame();
	}

	update() {
		const now = new Date();
		const dt = (now.getTime() - this.lastTime.getTime()) / 1000;
		const maxDT = 0.1;
		bomberman.update(Math.min(maxDT, dt));
		if ((now.getTime() - this.lastStateUpdateTime.getTime()) >= 1000 / this.STATE_UPDATE_FREQ_HZ) {
			this.lastStateUpdateTime = now;
			this.sendEntityStateUpdate();
		}
	}

	/**
	 * @param {number} slotId
	 * @param {string} uuid remote player's entity uuid
	 **/
	handlePlayerSpawned(slotId, uuid) {
		const [x, y] = bomberman.getPlayerSpawnPosition(slotId);
		const networkPlayer = new Player({
			x, y,
			skinNumber: slotId,
			uuid
		});
		networkPlayer.setInputController(this.createInputController(slotId));
	}

	createInputController(slotId) {
		this.inputControllers[slotId] = new InputController(new InputSource());
		return this.inputControllers[slotId];
	}

	/**
	 * @param {"key-pressed" | "key-released"} event
	 * @param {string} key name of key
	 * @param {number} slotId
	 **/
	handlePlayerInput(event, key, slotId) {
		if (this.inputControllers[slotId]) {
			this.inputControllers[slotId].inputSource.setKeyStatus(key, event === "key-pressed");
		}
	}

	/** sends a full entity state update to all clients */
	sendEntityStateUpdate() {
		this.socketService.broadcastStateUpdate(this.buildEntityStateUpdatePayload());
	}

	/**
	 * builds a full state-update event payload
	 * @returns {{[entityId: string]: EntityState}}
	 **/
	buildEntityStateUpdatePayload() {
		const payload = {};
		for (let entity of world.getEntities()) {
			payload[entity.uuid] = entity.buildStateData();
		}
		return payload;
	}
}
