const socket = new io("http://localhost:7075", {
	path: "/bomberman.io"
});

const SERVER_EVENTS = {
	SEND_USER_IDENTITY: "send_user_identity",
	USER_JOINED: "user_joined",
	USER_JOINED_LOBBY: "user_joined_lobby",
	PLAYER_UPDATED: "player_updated",
	PLAYER_DISCONNECTED : "player_disconnected",
	PLAYER_READY: "player_ready"
}

const CLIENT_EVENTS = {
	JOIN_GAME: "join_game",
	JOIN_LOBBY: "join_lobby",
	PLAYER_UPDATE: "player_update",
	GET_USERS_FROM_LOBBY: "get_users_from_lobby",
	PLAYER_READY: "player_ready"
}

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
		socket.on(SERVER_EVENTS.SEND_USER_IDENTITY, (userIdentityId) => observer.next(userIdentityId));
	});
}

export function joinGame(nickname) {
	return new Promise((resolve, reject) => {
		socket.emit(CLIENT_EVENTS.JOIN_GAME, nickname, () => {
			resolve();
		});
	});
}

export function joinLobby(nickname) {
	return new Promise((resolve, reject) => {
		socket.emit(CLIENT_EVENTS.JOIN_LOBBY, nickname, () => {
			resolve();
		});
	});
}

export function onUserJoindGame() {
	return new rxjs.Observable(observer => {
		socket.on(SERVER_EVENTS.USER_JOINED, (player) => {
			observer.next(player);
		})
	})
}

export function onUserJoindLobby() {
	return new rxjs.Observable(observer => {
		socket.on(SERVER_EVENTS.USER_JOINED_LOBBY, (player) => {
			observer.next(player);
		})
	})
}

export function sendPlayerUpdate(dx, dy, fire, reload) {
	return new Promise((resolve, reject) => {
		socket.emit(CLIENT_EVENTS.PLAYER_UPDATE, { dx, dy, fire, reload }, () => {
			resolve();
		});
	});
}

export function onPlayerUpdated() {
	return new rxjs.Observable(observer => {
		socket.on(SERVER_EVENTS.PLAYER_UPDATED, (updateInfo) => {
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
		socket.emit(CLIENT_EVENTS.GET_USERS_FROM_LOBBY, "", (players) => {
			resolve(players);
		});
	});
}

export function onUserDisconnected() {
	return new rxjs.Observable(observer => {
		socket.on(SERVER_EVENTS.PLAYER_DISCONNECTED, (userIdentityId) => {
			observer.next(userIdentityId);
		});
	});
}

export function sendPlayerReady() {
	return new Promise((resolve, reject) => {
		socket.emit(CLIENT_EVENTS.PLAYER_READY, "", () => {
			resolve();
		});
	});
}

export function onPlayerReady() {
	return new rxjs.Observable(observer => {
		socket.on(SERVER_EVENTS.PLAYER_READY, (userIdentityId) => {
			observer.next(userIdentityId);
		});
	});
}
