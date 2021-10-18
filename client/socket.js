const socket = new io("http://localhost:7075", {
	path: "/bomberman.io"
});

const SERVER_EVENTS = {
	SEND_USER_IDENTITY: "send_user_identity",
	USER_JOINED: "user_joined",
	PLAYER_UPDATED: "player_updated"
}

const CLIENT_EVENTS = {
	JOIN_GAME: "join_game",
	PLAYER_UPDATE: "player_update"
}

socket.on("connect", function() {
	console.log("Socket connected");
});

/**
 * Request server for a new session id. The session will be provided after the socket will connect.
 * @returns Promise<sessionId: string>
 */
export function requestUserIdentity() {
	return new rxjs.Observable(observer => {
		socket.on(SERVER_EVENTS.SEND_USER_IDENTITY, (sessionId) => observer.next(sessionId));
	});
}

export function joinGame(nickname) {
	return new Promise((resolve, reject) => {
		socket.emit(CLIENT_EVENTS.JOIN_GAME, nickname, () => {
			resolve();
		});
	});
}

export function onUserJoindGame() {
	return new rxjs.Observable(observer => {
		socket.on(SERVER_EVENTS.USER_JOINED, (nickname) => {
			observer.next(nickname);
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

socket.on("mesg", (msg) => {
	console.log(msg);
})
