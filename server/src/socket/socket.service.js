import { Server, Socket } from "socket.io";
import { ServerEvents } from "../../../common/socket/server-events.js";
import { ClientEvents } from "../../../common/socket/client-events.js";
import { ClientModel } from "../client-model.js";
import { UserService } from "../user.service.js";
import { SocketRoom } from "./socket-room.js";
import { UserStatus } from "../lobby-user.status.js";
import { EntityState } from "../../../common/entity-state.js";

const WEBSOCKET_CONSTANTS = {
	PORT : 7042,
	PATH : "/bomberman.io",
	TIMEOUT_SEC : 60, // timeout in seconds
	MAX_HTTP_BUFFER_SIZE : 1e7, // 1e7 = 100mb (default socket io value is 1e6 = 1mb)
}

export class SocketService {

	/** @type {Server} */
	server = null;
	/** @type {UserService} */
	userService = null;

	/** @type {(slotId: number, uuid: string) => void} */
	onPlayerSpawned = null;
	/** @type {({event: "key-pressed" | "key-released", key: string, playerSlot: number}) => void} */
	onPlayerInput = null;

	/**
	 * @param {http.Server} httpServer
	 * @param {UserService} userService
	 */
	constructor(
		httpServer,
		userService
	) {
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
		server.on("connection", (socket) => {
			this.userService.addClient(socket);
			this.sendUserIdentity(socket);

			this.handleUserJoindLobby(socket);
			this.handleUserJoindGame(socket);
			this.handlePlayerInput(socket);
			this.handleGetPlayersFromLobby(socket);
			this.handleSocketDisconnect(socket);
			this.handlePlayerReady(socket);
			this.handlePlayerSpawned(socket);
		});
	}

	handlePlayerInput(socket) {
		socket.on(ClientEvents.PLAYER_INPUT,
			/** @param {{event: "key-pressed" | "key-released", key: string}} event */
			(event) => {
				this.onPlayerInput(event.event, event.key, this.userService.getClientBySocket(socket).spawnSlotId);
				this.broadcastPlayerInput(event, socket);
			}
		);
	}

	/**
	 * @param {{event: "key-pressed" | "key-released", key: string}} event
	 * @param {Socket} socket
	 **/
	broadcastPlayerInput(event, socket) {
		socket.broadcast.to(SocketRoom.GAME_ROOM).emit(ServerEvents.PLAYER_INPUT, {
			...event,
			playerSlot: this.userService.getClientBySocket(socket).spawnSlotId
		});
	}

	handleUserJoindLobby(socket) {
		socket.on(ClientEvents.JOIN_LOBBY, (userNickname , ackFn) => {
			this.userService.setClientNickname(socket, userNickname);
			this.broadcastUserJoinedLobby(this.userService.getClientBySocket(socket));
			ackFn(this.userService.getClientBySocket(socket).spawnSlotId);
		});
	}

	handleUserJoindGame(socket) {
		socket.on(ClientEvents.JOIN_GAME, () => {
			this.userService.updateUserStatus(socket, UserStatus.INGAME);
			socket.join(SocketRoom.GAME_ROOM);
		});
	}

	/** @param {ClientModel} client */
	broadcastUserJoinedLobby(client) {
		client.socket.join(SocketRoom.LOBBY_ROOM);
		client.socket.broadcast.to(SocketRoom.LOBBY_ROOM).emit(ServerEvents.USER_JOINED_LOBBY, client.toDTO());
	}

	sendUserIdentity(socket) {
		socket.emit(ServerEvents.SEND_USER_IDENTITY,
			this.userService.getClientBySocket(socket).userIdentityId);
	}

	handleGetPlayersFromLobby(socket) {
		socket.on(ClientEvents.GET_USERS_FROM_LOBBY, (param, ackFn) => {
			ackFn(this.userService.getAllClients());
		});
	}

	handleSocketDisconnect(socket) {
		socket.on("disconnect", () => {
			const userIdentityId = this.userService.getClientBySocket(socket).userIdentityId;
			this.userService.deleteUser(socket);
			this.sendUserDisconnected(socket, userIdentityId);
			socket.leave(SocketRoom.LOBBY_ROOM);
			socket.leave(SocketRoom.GAME_ROOM);
		});
	}

	sendUserDisconnected(socket, userIdentityId) {
		socket.broadcast.to(SocketRoom.LOBBY_ROOM).emit(ServerEvents.PLAYER_DISCONNECTED, userIdentityId);
	}

	handlePlayerReady(socket) {
		socket.on(ClientEvents.PLAYER_READY, (prop, ackFn) => {
			this.userService.updateUserStatus(socket, UserStatus.READY);
			this.sendPlayerReady(socket);
			ackFn();
		});
	}

	handlePlayerSpawned(socket) {
		socket.on(ClientEvents.PLAYER_SPAWNED, ({slot, uuid}, ackFn) => {
			const client = this.userService.getClientBySocket(socket);
			if (client.spawnSlotId == slot) {
				this.onPlayerSpawned(slot, uuid);
				socket.broadcast.to(SocketRoom.GAME_ROOM).emit(ServerEvents.PLAYER_SPAWNED, {
					slot,
					uuid,
					nickname: client.nickname
				});
				ackFn();
			}
		});
	}

	sendPlayerReady(socket) {
		socket.broadcast.to(SocketRoom.LOBBY_ROOM).emit(ServerEvents.PLAYER_READY, this.userService.getClientBySocket(socket).userIdentityId);
	}

	broadcastStartRound(map) {
		this.server.emit(ServerEvents.START_ROUND, map);
	}

	broadcastStartGame() {
		this.server.emit(ServerEvents.START_GAME);
	}

	/** @param {{[entityId: string]: EntityState}} stateData */
	broadcastStateUpdate(stateData) {
		this.server.emit(ServerEvents.STATE_UPDATE, stateData);
	}
}
