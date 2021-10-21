export class InputSource {
	/** @private @type {{[key: string]: boolean}} */
	keys = {};

	/**
	 * @param {string} key name of the key
	 * @param {boolean} status true/false representing whether the key is currently pressed
	 */
	setKeyStatus(key, status) {
		this.keys[key] = status;
	}

	/**
	 * @param {string} key the name of the key
	 * @returns true if the requested key is pressed, false otherwise
	 */
	isKeyPressed(key) {
		return !!this.keys[key];
	}
}
