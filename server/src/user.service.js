import { v4 as uuidv4 } from "uuid";

export class UserService {

	constructor() {
		this.connectionsBySessionId = {};
		this.sessionIdByNickname = {};
	}

	addNicknameToSessioId(nickname, socket) {
		const sessionId = this.getSessionIdBySocket(socket);
		if (!sessionId) {
			throw new Error("No session id for current socket. Fix this.")
		}
		this.sessionIdByNickname[sessionId] = nickname;
	}

	generateNewSession(socket) {
		const sessionId = uuidv4();
		this.connectionsBySessionId[sessionId] = socket;
		return sessionId;
	}

	getSessionIdBySocket(socket) {
		for (const sessionId in this.connectionsBySessionId) {
			if (this.connectionsBySessionId.hasOwnProperty(sessionId)) {
				if (this.connectionsBySessionId[sessionId] === socket) {
					return sessionId;
				}
			}
		}
		return null;
	}
}
