import * as bomberman from "../../common/bomberman.js";
import * as constants from "../../common/constants.js";
import { generateRandomMap } from "../../common/random-map.js";
import { SocketService } from "./socket/socket.service.js";
export class GameService {

	UPDATE_FREQ_HZ = 50; // 50 times per second
	lastTime = new Date();
	/** @type {SocketService} */
	socketService = null;

	/** @param {SocketService} socketService */
	constructor(socketService) {
		this.socketService = socketService;
	}

	initialize() {
		bomberman.init(null);
	}

	startRound() {
		const map = generateRandomMap(constants.DEFAULT_MAP_ROWS, constants.DEFAULT_MAP_COLS);
		bomberman.startGame(map, null);
		this.socketService.broadcastStartRound(map);
	}

	startGame() {
		this.lastTime = new Date();
		setInterval(() => this.update(), 1000 / this.UPDATE_FREQ_HZ);
		this.socketService.broadcastStartGame();
	}

	update() {
		const now = new Date();
		const dt = (now.getTime() - this.lastTime.getTime()) / 1000;
		const maxDT = 0.1;
		bomberman.update(Math.min(maxDT, dt));
	}
}
