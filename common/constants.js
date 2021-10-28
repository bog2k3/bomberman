export const SCREEN_WIDTH = 320;
export const SCREEN_HEIGHT = 200;
export const TILE_SIZE = 16;
export const PLAYER_INITIAL_X_OFFS = 8;
export const PLAYER_INITIAL_Y_OFFS = 11;
export const PLAYER_INITIAL_SPEED = TILE_SIZE * 2; // pixels per second
export const PLAYER_SPEED_INCREMENT = PLAYER_INITIAL_SPEED * 0.5; // pixels per second
export const ENEMY_INITIAL_X_OFFS = 8;
export const ENEMY_INITIAL_Y_OFFS = 8;
export const ENEMY_SPEED = [ // pixels per second for each enemy type
	TILE_SIZE * 1,
	TILE_SIZE * 2
];
export const BOMB_FUSE_TIME = 4; // seconds
export const FIRE_DURATION = 2; // seconds

export const RANDOM_MAP_FILL_FACTOR_MIN = 0.4;
// export const RANDOM_MAP_FILL_FACTOR_MAX = 0.9;
export const RANDOM_MAP_FILL_FACTOR_MAX = 0.4;

export const RANDOM_MAP_ENEMY_DENSITY = 0.05; // enemies per tile for random map

export const DEFAULT_MAP_ROWS = 21;
export const DEFAULT_MAP_COLS = 31;

export const CHANCE_SPAWN_BOMB_POWERUP = 0.3;
export const CHANCE_SPAWN_RADIUS_POWERUP = 0.25;
export const CHANCE_SPAWN_SPEED_POWERUP = 0.15;

export const MAX_SPAWN_SLOTS = 7;
