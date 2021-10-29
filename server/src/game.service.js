import * as bomberman from "../../common/bomberman.js";
import * as constants from "../../common/constants.js";
import * as world from "../../common/world.js";
import { InputController } from "../../common/input-controller.js";
import { InputSource } from "../../common/input-source.js";
import { Player } from "../../common/player.js";
import { generateRandomMap } from "../../common/random-map.js";
import { SocketService } from "./socket/socket.service.js";
import { EntityState } from "../../common/entity-state.js";
import { Entity } from "../../common/entity.js";
import { Bomb } from "../../common/bomb.js";
import { serverState } from "./server-state.js";
import { UserService } from "./user.service.js";
import { ClientModel } from "./client-model.js";
export class GameService {

	UPDATE_FREQ_HZ = 60; // times per second
	STATE_UPDATE_FREQ_HZ = 5; // times per second
	lastTime = new Date();
	lastStateUpdateTime = new Date();
	/** @type {SocketService} */
	socketService = null;
	/** @type {UserService} */
	userService = null;
	/** @type {{[slotId: number]: InputController}} */
	inputControllers = {};
	updateInterval = null;
	/** @type {{[slotId: number]: {score: number, name: string}}} */
	scores = {};

	/**
	 * @param {SocketService} socketService
	 * @param {UserService} userService
	 **/
	constructor(socketService, userService) {
		this.socketService = socketService;
		this.userService = userService;
		this.socketService.onPlayerSpawned.subscribe(this.handlePlayerSpawned.bind(this));
		this.socketService.onPlayerInput.subscribe(this.handlePlayerInput.bind(this));
		this.socketService.onPlayerDisconnected.subscribe(this.handlePlayerDisconnected.bind(this));
		this.userService.onLateClientJoin.subscribe(this.handleLateClientJoin.bind(this));
	}

	initialize() {
		bomberman.init(null);
		world.onEntityAdded.subscribe(this.broadcastEntityCreated.bind(this));
		world.onEntityRemoved.subscribe(this.broadcastEntityRemoved.bind(this));
		world.onBrickDestroyed.subscribe(this.broadcastBrickDestroyed.bind(this));
	}

	stopGame() {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
		}
		bomberman.reset();
		this.inputControllers = {};
		this.scores = {};
		serverState.status = "in-lobby";
		this.socketService.broadcastStopGame();
		console.log("Game stopped.");
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
		console.log("Game created.");
	}

	startGame() {
		serverState.status = "in-game";
		this.lastTime = new Date();
		this.lastStateUpdateTime = new Date();
		this.updateInterval = setInterval(() => this.update(), 1000 / this.UPDATE_FREQ_HZ);
		this.socketService.broadcastStartGame();
		console.log("Game started.");
	}

	update() {
		const now = new Date();
		const dt = (now.getTime() - this.lastTime.getTime()) / 1000;
		this.lastTime = now;
		const maxDT = 0.1;
		bomberman.update(Math.min(maxDT, dt));
		if ((now.getTime() - this.lastStateUpdateTime.getTime()) >= 1000 / this.STATE_UPDATE_FREQ_HZ) {
			this.lastStateUpdateTime = now;
			this.broadcastEntityStateUpdate();
		}
	}

	/**
	 * @param {number} slotId
	 * @param {string} uuid remote player's entity uuid
	 * @param {string} nickname
	 **/
	handlePlayerSpawned(slotId, uuid, nickname) {
		const [x, y] = bomberman.getPlayerSpawnPosition(slotId);
		const networkPlayer = new Player({
			x, y,
			skinNumber: slotId,
			uuid,
			name: nickname
		});
		networkPlayer.onFragRegistered.subscribe(this.handleFragRegistered.bind(this));
		networkPlayer.setInputController(this.createInputController(slotId));
		if (!this.scores[slotId]) {
			this.scores[slotId] = {
				name: nickname,
				score: 0
			};
		}
	}

	createInputController(slotId) {
		this.inputControllers[slotId] = new InputController(new InputSource());
		this.inputControllers[slotId].onBombSpawnRequest.subscribe(this.handleBombSpawnRequest.bind(this))
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

	handleBombSpawnRequest(row, col, player) {
		player.bombCount++;
		(new Bomb(player.bombPower, row, col, player.skinNumber))
			.onDestroy.subscribe(() => player.bombCount--);
	}

	/** sends a full entity state update to all clients */
	broadcastEntityStateUpdate() {
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
		payload["scores"] = this.buildScores();
		return payload;
	}

	/** @param {Entity} e */
	broadcastEntityCreated(e) {
		if (!(e instanceof Player)) { // because players are handled by a different mechanism
			this.socketService.broadcastEntityCreated(e.serialize());
		}
	}

	sendLiveEntities(socket) {
		this.socketService.sendLiveEntities(socket,
			world.getEntities()
				.map(e => e.serialize())
		);
	}

	/** @param {Entity} e */
	broadcastEntityRemoved(e) {
		this.socketService.broadcastEntityRemoved(e.uuid);
	}

	broadcastBrickDestroyed(row, column) {
		this.socketService.broadcastBrickDestroyed({row, column});
	}

	/** @returns {{name: string, score: number, slot: number}[]} */
	buildScores() {
		/** @type {{name: string, score: number, slot: number}[]} */
		const scores = [];
		for (let slotId in this.scores) {
			scores.push({
				name: this.scores[slotId].name,
				score: this.scores[slotId].score,
				slot: slotId
			});
		}
		return scores;
	}

	handleFragRegistered(victimSlot, killerSlot) {
		if (!this.scores[killerSlot]) {
			return; // killer probably got disconnected in the mean time
		}
		if (victimSlot == killerSlot) {
			// poor bastard killed himself
			this.scores[killerSlot].score--;
		} else {
			this.scores[killerSlot].score++;
		}
	}

	handlePlayerDisconnected(slotId) {
		console.log(`Player ${this.scores[slotId]?.name || "Unknown"} disconnected.`);
		world.getEntities()
			.filter(
				e => e instanceof Player && e.skinNumber == slotId
			).forEach(
				e => e.die()
			)
		delete this.scores[slotId];
		if (Object.keys(this.scores) == 0) {
			console.log("No players left, stopping game.");
			// all players left, we go back to lobby
			this.stopGame();
		}
	}

	/** @param {ClientModel} client */
	handleLateClientJoin(client) {
		console.log(`New player "${client.nickname}" joined during game.`)
		// send start_round and then start_game
		this.socketService.sendStartRound(client.socket, world.getMap());
		this.socketService.sendStartGame(client.socket);
		this.sendLiveEntities(client.socket);
	}
}
