export class Event {
	/** @private */
	subscribers = [];

	/**
	 * Adds a new subscriber to the event and returns the subscription id (which can be used later to unsubscribe)
	 * @param {(...args) => void} handler
	 * @returns {number} the id of the newly created subscription
	 */
	subscribe(handler) {
		this.subscribers.push(handler);
		return this.subscribers.length - 1;
	}

	/**
	 * Removes a subscription with the indicated id (if it exists)
	 * @param {number} subscriptionId
	 */
	unsubscribe(subscriptionId) {
		if (subscriptionId < this.subscribers.length) {
			this.subscribers[subscriptionId] = null;
		}
	}

	/**
	 * Triggers the event, calling all subscribers with the received arguments
	 * @param {...any} args arguments to pass to subscribers
	 **/
	trigger(...args) {
		for (let handler of this.subscribers) {
			if (handler) {
				handler(...args);
			}
		}
	}
}
