import { v4 as uuidv4 } from "uuid";
import { LobbyUserStatus } from "./lobby-user.status.js";
export class UserService {

	constructor() {

		/**
		 * @type {userIdentityId: session}
		 */
		this.connectionsByUserIdentityId = {};

		/**
		 * @type [
		 *		nickname,
		 *		status: "loading", "ready",
		 *		userIdentityId
		 * ]
		 */
		this.lobbyUsers = [];
	}

	deleteUser(socket) {
		const user = this.getUserFromLobby(socket);
		if (user) {
			this.lobbyUsers.splice(this.lobbyUsers.indexOf(user), 1);
		}
		const userIdentityId = this.getUserIdentityIdBySocket(socket);
		if (userIdentityId) {
			delete this.connectionsByUserIdentityId[userIdentityId];
		}
	}

	generateNewUserIdentity(socket) {
		const userIdentityId = uuidv4();
		this.connectionsByUserIdentityId[userIdentityId] = socket;
		return userIdentityId;
	}

	getUserIdentityIdBySocket(socket) {
		for (const userIdentityId in this.connectionsByUserIdentityId) {
			if (this.connectionsByUserIdentityId.hasOwnProperty(userIdentityId)) {
				if (this.connectionsByUserIdentityId[userIdentityId] === socket) {
					return userIdentityId;
				}
			}
		}
		return null;
	}

	addUserToLobby(socket, nickname) {
		this.lobbyUsers.push({
			nickname,
			userIdentityId: this.getUserIdentityIdBySocket(socket),
			status: LobbyUserStatus.WAITING
		});
	}

	getUsersFromLobby() {
		return this.lobbyUsers;
	}

	getUserFromLobby(socket) {
		const userIdentityId = this.getUserIdentityIdBySocket(socket);
		for (let index = 0; index < this.lobbyUsers.length; index++) {
			if (this.lobbyUsers[index].userIdentityId === userIdentityId) {
				return this.lobbyUsers[index];
			}
		}
		return null;
	}

	updateUserStatusToReady(socket) {
		this.getUserFromLobby(socket).status = LobbyUserStatus.READY;
	}
}
