import { Socket } from "socket.io";
export class ClientModel {
	/** @type {string} */
	userIdentityId = null;
	/** @type {string} */
	nickname = null;
	/** @type {"loading" | "ready"} */
	status = "loading";
	/** @type {Socket} */
	socket = null;
	/** @type {number} */
	spawnSlotId = null;

	/** @param {ClientModel?} data */
	constructor(data) {
		if (data) {
			Object.assign(this, data);
		}
	}

	/** @returns {Partial<ClientModel>} returns a partial copy of the model, skipping server-only properties, such as "socket". */
	toDTO() {
		const dto = {...this};
		delete dto.socket;
		return dto;
	}
}
