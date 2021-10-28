import { ClientEvents } from "../common/socket/client-events.js";
import { ServerEvents } from "../common/socket/server-events.js";

const socket = new io("http://localhost:7042", {
	path: "/bomberman.io"
});

export function socketConnected() {
	return new rxjs.Observable(observer => {
		socket.on("connect", function() {
			observer.next();
		});
	});
}


/**
 * Request server for a new session id. The session will be provided after the socket will connect.
 * @returns Promise<sessionId: string>
 */
export function requestUserIdentity() {
	return new rxjs.Observable(observer => {
		socket.on(ServerEvents.SEND_USER_IDENTITY, (userIdentityId) => observer.next(userIdentityId));
	});
}

export function joinGame() {
	return new Promise((resolve, reject) => {
		socket.emit(ClientEvents.JOIN_GAME, resolve);
	});
}

/** @returns {Promise<number>} the resolved value is the spawn slot id */
export function joinLobby(nickname) {
	return new Promise((resolve, reject) => {
		socket.emit(ClientEvents.JOIN_LOBBY, nickname, (slotId) => {
			resolve(slotId);
		});
	});
}

// export function onUserJoindGame() {
// 	return new rxjs.Observable(observer => {
// 		socket.on(ServerEvents.USER_JOINED, (player) => {
// 			observer.next(player);
// 		})
// 	})
// }

export function onUserJoindLobby() {
	return new rxjs.Observable(observer => {
		socket.on(ServerEvents.USER_JOINED_LOBBY, (player) => {
			observer.next(player);
		})
	})
}

export function sendPlayerUpdate(dx, dy, fire, reload) {
	return new Promise((resolve, reject) => {
		socket.emit(ClientEvents.PLAYER_UPDATE, { dx, dy, fire, reload }, () => {
			resolve();
		});
	});
}

export function onPlayerUpdated() {
	return new rxjs.Observable(observer => {
		socket.on(ServerEvents.PLAYER_INPUT, (updateInfo) => {
			observer.next(updateInfo);
		})
	})
}

export function sendGo() {
	return new Promise((resolve, reject) => {
		socket.emit("go", "", () => {
			resolve();
		});
	});
}


export function goPlayer() {
	return new rxjs.Observable(observer => {
		socket.on("go-player", (updateInfo) => {
			observer.next();
		})
	})
}

export function getUsersFromLobby() {
	return new Promise((resolve, reject) => {
		socket.emit(ClientEvents.GET_USERS_FROM_LOBBY, "", (players) => {
			resolve(players);
		});
	});
}

export function onUserDisconnected() {
	return new rxjs.Observable(observer => {
		socket.on(ServerEvents.PLAYER_DISCONNECTED, (userIdentityId) => {
			observer.next(userIdentityId);
		});
	});
}

export function sendPlayerReady() {
	return new Promise((resolve, reject) => {
		socket.emit(ClientEvents.PLAYER_READY, "", () => {
			resolve();
		});
	});
}

/** @param {(userIdentityId: number) => void } callback */
export function onPlayerReady(callback) {
	socket.on(ServerEvents.PLAYER_READY, callback);
}

/** @param {(map: number[][]) => void} callback */
export function onStartRound(callback) {
	socket.on(ServerEvents.START_ROUND, callback);
}

/** @param {() => void} callback */
export function onStartGame(callback) {
	socket.on(ServerEvents.START_GAME, callback);
}

/** @param {(slot: number, nickname: string) => void} callback */
export function onNetworkPlayerSpawned(callback) {
	socket.on(ServerEvents.PLAYER_SPAWNED, ({slot, nickname}) => callback(slot, nickname));
}

/** @param {{event: "key-pressed" | "key-released", key: string}} event */
export function sendPlayerKeyEvent(event) {
	// TODO send the event to the server which will broadcast back to all other players in order for them to move their representation of our player
	socket.emit(ClientEvents.PLAYER_INPUT, event);
}

/** @returns {Promise<void>} a promise that is resolved when the server accepts and validates the event */
export function sendPlayerSpanwed(playerSlot) {
	return new Promise(resolve =>
		socket.emit(ClientEvents.PLAYER_SPAWNED, {
			slot: playerSlot
		}, resolve)
	);
}

/**
 * @param {({event: "key-pressed" | "key-released", key: string, playerSlot: number}) => void} callback
 */
export function onNetworkPlayerInput(callback) {
	socket.on(ServerEvents.PLAYER_INPUT, callback);
}
