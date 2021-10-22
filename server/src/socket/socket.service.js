import { Server, Socket } from "socket.io";
import { ClientEvent } from "./client-event.js";
import { ServerEvents } from "./server-events.js";
import { SocketRoom } from "./socket-room.js";

const WEBSOCKET_CONSTANTS = {
	PORT : 7042,
	PATH : "/bomberman.io",
	TIMEOUT_SEC : 60, // timeout in seconds
	MAX_HTTP_BUFFER_SIZE : 1e7, // 1e7 = 100mb (default socket io value is 1e6 = 1mb)
}

export class SocketService {

	constructor(
		httpServer,
		userService
	) {
		this.server = this.createSocketServer(httpServer);
		/**
		 * @type UserService
		 */
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
		server.on("connection", (socket) => {
			this.sendUserIdentity(socket);
			this.onUserJoindLobby(socket);
			this.onPlayerUpdate(socket);
			this.onGetPlayersFromLobby(socket);
			this.onSocketDisconnect(socket);
			this.onPlayerReady(socket);
		});
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
			sessionId: this.userService.getUserIdentityIdBySocket(socket)
		});

	}

	onUserJoindLobby(socket) {
		socket.on(ClientEvent.JOIN_LOBBY, (userNickname , ackFn) => {
			this.userService.addUserToLobby(socket, userNickname);
			this.sendUserJoinedLobby(socket);
			ackFn();
		});
	}

	onUserJoindGame(socket) {
		socket.join(SocketRoom.GAME_ROOM);
	}

	sendUserJoinedLobby(socket) {
		socket.join(SocketRoom.LOBBY_ROOM);
		const player = this.userService.getUserFromLobby(socket);
		socket.broadcast.to(SocketRoom.LOBBY_ROOM).emit(ServerEvents.USER_JOINED_LOBBY, player);
	}

	sendUserIdentity(socket) {
		const userIdentityId = this.userService.generateNewUserIdentity(socket);
		socket.emit(ServerEvents.SEND_USER_IDENTITY, userIdentityId);
	}

	onGetPlayersFromLobby(socket) {
		socket.on(ClientEvent.GET_USERS_FROM_LOBBY, (param, ackFn) => {
			ackFn(this.userService.getUsersFromLobby());
		});
	}

	onSocketDisconnect(socket) {
		socket.on("disconnect", () => {
			const userIdentityId = this.userService.getUserIdentityIdBySocket(socket);
			this.userService.deleteUser(socket);
			this.sendUserDisconnected(socket, userIdentityId);
			socket.leave(SocketRoom.LOBBY_ROOM);
			socket.leave(SocketRoom.GAME_ROOM);
		});
	}

	sendUserDisconnected(socket, userIdentityId) {
		socket.broadcast.to(SocketRoom.LOBBY_ROOM).emit(ServerEvents.PLAYER_DISCONNECTED, userIdentityId);
	}

	onPlayerReady(socket) {
		socket.on(ClientEvent.PLAYER_READY, (prop, ackFn) => {
			this.userService.updateUserStatusToReady(socket);
			this.sendPlayerReady(socket);
			ackFn();
		});
	}

	sendPlayerReady(socket) {
		socket.broadcast.to(SocketRoom.LOBBY_ROOM).emit(ServerEvents.PLAYER_READY, this.userService.getUserIdentityIdBySocket(socket));
	}
}
