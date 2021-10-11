/**
 * 0 - empty space (field)
 * 1 - regular brick
 * 2 - indestructable brick
 * 3 - enemy type 0
 * 4 - enemy type 1
 * 5 - enemy type 2
 * ...
 * 9 - player
 */
 const map0 = [
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	[2, 9, 0, 1, 0, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 0, 9, 2],
	[2, 0, 1, 1, 0, 1, 1, 2, 1, 1, 2, 1, 0, 0, 0, 1, 1, 1, 0, 2, 0, 1, 2, 0, 1, 1, 1, 1, 0, 0, 2],
	[2, 1, 1, 2, 3, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 2, 0, 1, 1, 3, 1, 0, 0, 1, 0, 1, 2],
	[2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 2, 3, 1, 1, 1, 1, 2, 2, 2, 0, 2, 2],
	[2, 1, 1, 0, 0, 2, 1, 0, 1, 1, 0, 1, 2, 1, 0, 0, 1, 1, 1, 2, 0, 0, 1, 0, 1, 2, 0, 0, 0, 2, 2],
	[2, 1, 1, 1, 1, 2, 2, 3, 1, 0, 1, 2, 2, 1, 1, 4, 2, 1, 0, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 1, 2],
	[2, 3, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 2],
	[2, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 2, 2, 1, 0, 1, 1, 1, 1, 1, 0, 0, 2],
	[2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 2, 2, 2, 1, 0, 0, 2],
	[2, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 4, 1, 1, 2, 0, 1, 0, 0, 0, 2],
	[2, 1, 0, 1, 0, 1, 1, 2, 0, 1, 0, 1, 0, 2, 4, 1, 1, 1, 2, 1, 1, 0, 1, 1, 2, 1, 1, 1, 0, 1, 2],
	[2, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 0, 2, 2, 2, 2, 0, 2, 2],
	[2, 1, 0, 1, 1, 2, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2],
	[2, 2, 2, 1, 0, 2, 3, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 0, 1, 1, 0, 2, 1, 1, 0, 1, 2],
	[2, 1, 0, 1, 1, 2, 0, 1, 1, 1, 1, 2, 2, 2, 1, 0, 1, 0, 0, 2, 2, 3, 1, 0, 1, 3, 0, 0, 0, 2, 2],
	[2, 1, 1, 2, 1, 1, 1, 1, 0, 3, 1, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 2],
	[2, 0, 1, 1, 0, 3, 1, 1, 1, 1, 1, 2, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 3, 1, 0, 1, 1, 1, 0, 0, 2],
	[2, 0, 1, 1, 0, 3, 1, 1, 1, 1, 1, 2, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 3, 1, 0, 1, 1, 1, 0, 0, 2],
	[2, 9, 0, 1, 1, 1, 2, 0, 1, 1, 0, 2, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, 0, 0, 1, 1, 0, 0, 9, 2],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

/** the map templates collection that can be used to instantiate a map from */
export const mapsCollection = [map0];