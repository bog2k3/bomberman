export const serverState = {
	/** @type {"in-lobby"|"in-game"} */
	status: "in-lobby",

	inLobby: function() {
		return serverState.status == "in-lobby";
	},

	inGame: function() {
		return serverState.status == "in-game";
	},
};
