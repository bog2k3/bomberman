import { v4 as uuidv4 } from "uuid";
import { LobbyUserStatus } from "./lobby-user.status.js";
import { Socket } from "socket.io";
import { Event } from "../../common/event.js";
import { ClientModel } from "./client-model.js";
import * as constants from "../../common/constants.js";
export class UserService {

	/** @type {ClientModel[]} */
	clients = [];

	/** @type {{[socketId: string]: ClientModel}} */
	clientsBySocketId = {};

	onAllUsersReady = new Event();

	constructor() { }

	/** @param {Socket} socket */
	deleteUser(socket) {
		const client = this.clientsBySocketId[socket.id];
		if (client) {
			this.clients.splice(this.clients.indexOf(client), 1);
		}
		delete this.clientsBySocketId[socket.id];
	}

	generateNewUserIdentity() {
		return uuidv4();
	}

	/** @param {Socket} socket */
	addClient(socket) {
		this.clients.push(new ClientModel({
			socket,
			nickname: "Anonymous",
			userIdentityId: this.generateNewUserIdentity(),
			status: LobbyUserStatus.WAITING,
			spawnSlotId: this.getRandomAvailableSlotId()
		}));
		this.clientsBySocketId[socket.id] = this.clients[this.clients.length-1];
	}

	/** @param {Socket} socket @param {string} nickname */
	setClientNickname(socket, nickname) {
		if (this.clientsBySocketId[socket.id]) {
			this.clientsBySocketId[socket.id].nickname = nickname;
		}
	}

	getAllClients() {
		return this.clients.map(client => client.toDTO());
	}

	/**
	 * @param {Socket} socket
	 * @returns {ClientModel} the client associated with the socket
	 **/
	getClientBySocket(socket) {
		return this.clientsBySocketId[socket.id];
	}

	/** @param {Socket} socket */
	updateUserStatusToReady(socket) {
		const client = this.getClientBySocket(socket);
		if (client) {
			client.status = LobbyUserStatus.READY;
			if (this.areAllUsersReady()) {
				this.onAllUsersReady.trigger();
			}
		}
	}

	/** @returns {boolean} */
	areAllUsersReady() {
		return this.clients.every(client => client.status == "ready");
	}

	/** @private @returns {number} a randomly selected spawn slot id that is not yet used. */
	getRandomAvailableSlotId() {
		let slotId;
		do {
			slotId = Math.floor(Math.random() * constants.MAX_SPAWN_SLOTS);
		} while (this.clients.some(client => client.spawnSlotId == slotId));
		return slotId;
	}
}
