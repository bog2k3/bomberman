import { LobbyUserStatus } from "./lobby-user.status.js";

export function addPlayerToLobby(playerName, playerStatus, playerId, currentPlayerId) {
	const playerElement = createElement(
		"div",
		playerId,
		["player"]
	);

	playerElement.appendChild(
		createSpanTextElement(playerName)
	);
	if (playerId === currentPlayerId) {
		playerElement.appendChild(
			createCheckbox()
		);
	} else {
		playerElement.appendChild(
			createPlayrtSatusElement(playerId, playerStatus)
		);
	}
	document.getElementById("lobby").appendChild(playerElement);
}

export function createPlayrtSatusElement(playerId, playerStatus) {
	const statusElement = createElement("span", "status_" + playerId);

	let playerIconElement;
	if (playerStatus === LobbyUserStatus.WAITING) {
		playerIconElement = createFaIcon("fa-spinner");
	} else if (playerStatus === LobbyUserStatus.READY) {
		playerIconElement = createFaIcon("fa-check");
	} else if (playerStatus === LobbyUserStatus.INGAME) {
		playerIconElement = createFaIcon("fa-male");
	} else {
		throw new Error(`Unknown player status ${playerStatus}`)
	}
	statusElement.appendChild(
		playerIconElement
	);
	return statusElement;
}

export function changePlayerStatus(playerId, playerStatus) {
	const statusElement = document.getElementById("status_" + playerId);
	if (!statusElement) {
		return;
	}
	statusElement.innerHTML = "";
	statusElement.appendChild(
		playerStatus === LobbyUserStatus.WAITING
			? createFaIcon("fa-spinner")
			: createFaIcon("fa-check")
	);
}

export function createLobbyElement() {
	return createElement("div", "lobby");
}

export function createJoinElements() {
	const joinDivElemnt = createElement("div", "join");
	const joinInputDivElement = createElement("div", "join-input");

	const joinInputIconElement = createElement(
		"i",
		"join-textbox-icon",
		["fa fa-user"],
		[ createAttribute("aria-hidden", "true") ]
	);

	const joinInputElement = createElement("input", "join-textbox", null, [ createAttribute("type", "text")]);

	const joinButtonElement = createElement("button", "join-button");
	joinButtonElement.innerHTML = "JOIN";

	joinInputDivElement.appendChild(joinInputIconElement);
	joinInputDivElement.appendChild(joinInputElement);

	joinDivElemnt.appendChild(joinInputDivElement);
	joinDivElemnt.appendChild(joinButtonElement);

	return joinDivElemnt;

}

export function attachCallbackToJoinButtonClick(callback) {
	const joinButton = document.getElementById("join-button");
	if (joinButton) {
		joinButton.addEventListener("click", callback);
	}
}

export function getJoinInputValue() {
	const inputText = document.getElementById("join-textbox");
	return inputText?.value;
}

export function attachCallbackToUserReadyCheckbox(userIdentityId, callback) {
	const playerElement = document.getElementById(userIdentityId);
	if (playerElement) {
		const playerReadyCheckbox = playerElement.getElementsByTagName("input")[0];
		playerReadyCheckbox.addEventListener("change", (event) => callback(event, playerReadyCheckbox));
	}
}

export function deleteUserDomElement(userIdentityId) {
	delteElementById(userIdentityId);
}

export function deleteJoinDOMElement() {
	delteElementById("join");
}

export function deleteLobbyDOMElement() {
	delteElementById("lobby");
}

function delteElementById(elementId) {
	if (elementId) {
		const element = document.getElementById(elementId);
		if (element) {
			element.remove();
		}
	}
}

function createCheckbox() {
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";

	return checkbox;
}

function createSpanTextElement(text) {
	const textElement = document.createElement("span");
	textElement.innerHTML = text;
	return textElement;
}

function createFaIcon(iconClass) {
	return createElement(
		"i",
		null,
		[`fa ${iconClass}`],
		[ createAttribute("ariaHidden", "true") ])
}

function createElement(tagName, id, classNames, attributes) {
	const element = document.createElement(tagName);
	if (id) {
		element.id = id;
	}
	if (classNames && classNames.length > 0) {
		element.classList = classNames;
	}
	if (attributes && attributes.length > 0) {
		for (const attribute of attributes) {
			element.setAttributeNode(attribute);
		}
	}
	return element;
}

function createAttribute(name, val) {
	const attribute = document.createAttribute(name);
	attribute.value = val;
	return attribute;
}
