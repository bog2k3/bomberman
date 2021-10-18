const { Server } = require("socket.io");

const ClientEvent = require("./client-event.js");
const ServerEvents = require("./server-events.js");
const SocketRoom = require("./socket-room");

const WEBSOCKET_CONSTANTS = {
	PORT : 7075,
	PATH : "/bomberman.io",
	TIMEOUT_SEC : 60, // timeout in seconds
	MAX_HTTP_BUFFER_SIZE : 1e7, // 1e7 = 100mb (default socket io value is 1e6 = 1mb)
}

class SocketService {

	constructor(
		httpServer,
		userService
	) {
		this.sockets = [];
		this.server = this.createSocketServer(httpServer);

		this.userService = userService;
		this.subscribeToEvents(this.server);

	}

	createSocketServer(httpServer) {
		return new Server(httpServer, {
			pingTimeout: WEBSOCKET_CONSTANTS.TIMEOUT_SEC,
			maxHttpBufferSize: WEBSOCKET_CONSTANTS.MAX_HTTP_BUFFER_SIZE,
			allowEIO3: false,
			path: WEBSOCKET_CONSTANTS.PATH,
			cors: {
				origin: "*"
			}
		});
	}

	subscribeToEvents(server) {

		server.on('connection', (socket) => {
			console.log('a user connected');
		});

		server.on("connection", (socket) => {

			this.sockets.push(socket);

			this.sendUserIdentity(socket);
			this.onUserJoindGame(socket);
			this.onPlayerUpdate(socket);
		})
	}

	onPlayerUpdate(socket) {
		socket.on(ClientEvent.PLAYER_UPDATE, (updatePlayerData, ackFn) => {
			this.sendPlayerUpdate(updatePlayerData, socket);
			ackFn();
		});
	}

	sendPlayerUpdate(updatePlayerData, socket) {
		socket.broadcast.to(SocketRoom.GAME_ROOM).emit(ServerEvents.PLAYER_UPDATED, {
			dx: updatePlayerData.dx,
			dy: updatePlayerData.dy,
			fire: updatePlayerData.fire,
			sessionId: this.userService.getSessionIdBySocket(socket)
		});

	}

	onUserJoindGame(socket) {
		socket.on(ClientEvent.JOIN_GAME, (clientNickname , ackFn) => {
			this.userService.addNicknameToSessioId(clientNickname, socket);
			socket.join(SocketRoom.GAME_ROOM);
			this.sendUserJoined(clientNickname, socket);
			ackFn();
		});
	}

	sendUserJoined(nickname, socket) {
		for (const item of this.sockets) {
			if (item != socket) {
				item.emit(ServerEvents.USER_JOINED, { nickname, sessionId: this.userService.getSessionIdBySocket(socket)} );
			}
		}
	}

	sendUserIdentity(socket) {
		const sessionId = this.userService.generateNewSession(socket);
		socket.emit(ServerEvents.SEND_USER_IDENTITY, sessionId);
	}
}

module.exports = { SocketService };
