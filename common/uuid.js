export function generateUuid() {
	let uuid = "";
	const groups = 6;
	for (let i=0; i<groups; i++) {
		if (i > 0) {
			uuid += "-";
		}
		uuid += Math.floor(Math.random() * 0xFFFF).toString(16);
	}
	return uuid;
}
