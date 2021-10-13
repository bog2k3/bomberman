import { dosemu } from "./node_modules/dosemu/index.js";
import { Player } from "./player.js";
import { Entity } from "./entity.js";
import { Theme } from "./theme.js";
import * as constants from "./constants.js";

export function init() {
	// building trigonometric tables //
	build_sincos();
}

export function update(player, dt) {
	// handle player input (keyboard) //
	handlePlayerInput(player, dt);
}

// some often-used angles //
const angle_1 = 5.3333;
const angle_3 = 16;
const angle_5 = 26.6666;
const angle_45 = 240;
const angle_90 = 480;
const angle_360 = 1920;
const angle_30 = 160;
const angle_180 = 960;
const angle_270 = 1440;

const maxx = 319;
const maxy = 199;

// player speed //
const move_speed = 150.0;
const turn_speed = angle_180;
const mouse_speed = 500;

const tileSize = constants.TILE_SIZE;

// Trigonometric tables //
const _sin = []; // [1920]
const _cos = []; // [1920]
const _tan = []; // [1920]

function build_sincos() {
	for (let i=0; i<1920; i++) {
		_sin[i] = Math.sin( i * 2 * Math.PI / 1920 ) ;
		_cos[i] = Math.cos( i * 2 * Math.PI / 1920 ) ;
		_tan[i] = Math.tan( i * 2 * Math.PI / 1920 ) ;
	}
}

/** @param {Player} player */
export function updatePlayerAngle(player) {
	switch (player.orientation) {
		case "up": player.angle = angle_270; break;
		case "down": player.angle = angle_90; break;
		case "left": player.angle = angle_180; break;
		case "right": player.angle = 0; break;
	}
}

/** @param {Theme} theme */
function drawtex(x, y, id, col, h, dist, theme) {
	if ( h < 1 ) return;
	const step = tileSize / h;
	let texRow = 0;
	if ( y < 0 ) {     // clip the texture if it's bigger than the screen //
		texRow = -step * y; // to draw only what is visible 					  //
		h = 200;
		y = 0;
	}
	for (let i = 0; i < h; i++) {
		dosemu.drawPixel(x, y + i, theme.brickSprites[id].pixels[ Math.floor(texRow)][ col ]);
		texRow += step;
	}
}

/**
 *
 * @param {number[][]} map
 * @param {Player} player
 * @param {Entity[]} entities
 * @param {Theme} theme
 */
export function render(map, player, entities, theme) {
	/* int */ let px, py, hy, vx, hd, vd, hid, vid, a, wh, pxm, pxp, pym, pyp;
	/* float */ let hx, vy, xs, ys;

	const map_maxx = map[0].length * tileSize - 1;
	const map_maxy = map.length * tileSize - 1;

	px = Math.floor(player.x); // [player.x] //
	py = Math.floor(player.y); // [player.y] //
	a = Math.floor(player.angle - angle_30); // current ray's angle //
	pxm = (Math.floor(px / tileSize) * tileSize) - 1;
	pxp = (Math.floor(px / tileSize) * tileSize) + tileSize;
	pym = (Math.floor(py / tileSize) * tileSize) - 1;
	pyp = (Math.floor(py / tileSize) * tileSize) + tileSize;

	for (let i = 0; i <= maxx; i++) {		// make sure the angle is in //
		a += a < 0 ? angle_360 : 0;			// the [0,360) interval 	 //
		a -= a >= angle_360 ? angle_360 : 0;

		// horizontal grids //

		if ( a == angle_180 || a == 0 ) {  // if the ray is goind paralel //
			hd = 999999;     			   // with the walls, skip this   //
		} else {
			if ( a > angle_180 ) {			// is it goind up ? //
				hy = pym;
				ys = -tileSize;
			} else {						// or down ? //
				hy = pyp;
				ys = tileSize;
			}
			hx = ( ( hy - py ) / _tan[ a ] ) + px; // 1st intersection pt //
			xs = ys / _tan[ a ];				// deltaX / step 	   //

			do {
				if ( hx < 0 || hy < 0 || hx > map_maxx || hy > map_maxy ) {
					hd = 999999; // are we out of the map ? //
					break;
				}
				if ( map[ Math.floor(hy / tileSize) ] [ Math.floor(hx / tileSize) ] ) {
					hd = Math.floor(( hy - py ) / _sin[ a ]); // did we hit a wall ? //
					hid = tileSize - 1 - Math.floor(hx) % tileSize; // if so, calculate the distance to the wall //
					// and the texture offset and jump out of the loop //
					break;
				}
				hx += xs; // no wall ? //
				hy += Math.floor(ys); // keep searching... //
			} while (1);
		}

		// verical grids //

		if ( a == angle_90 || a == angle_270 ) { // are we paralel ? //
			vd = 999999;	// then there is no point searching for an intersection, is it ? //
		} else {
			if ( a > angle_90 && a < angle_270 ) { // is the ray going left ? //
				vx = pxm;
				xs = -tileSize;
			} else { 							   // or right ? //
				vx = pxp;
				xs = tileSize;
			}
			vy = ( ( vx - px ) * _tan[ a ] ) + py;
			ys = xs * _tan[ a ];

			do {
				if ( vx < 0 || vy < 0 || vx > map_maxx || vy > map_maxy ) {
					vd = 999999; // we're out of the map //
					break;
				}
				if ( map[ Math.floor(vy / tileSize) ] [ Math.floor(vx / tileSize) ] ) {
					vd = Math.floor(( vx - px ) / _cos[ a ]); // a wall ! //
					vid = Math.floor(vy) % tileSize; // get the distance and tex offset //
					break;
				}
				vx += Math.floor(xs); // keep going until we //
				vy += ys; // hit something or we get out of the map //
			} while (1);
		}

		if ( hd > vd ) { // see which of the walls is closer //
			hd = vd;
			hid = vid;
			hx = vx;
			hy = Math.floor(vy);
		}

		// and finally draw the wall //
		// if it's not a fake wall (map-bound) //
		if ( hd < 999999 ) {
			// remove fish-bowl defformation //
			hd = Math.floor(hd * _cos[ Math.floor(Math.abs( a - player.angle )) ]);
			// calculate wall slice height //
			wh = hd > 0 ? Math.floor(277 * tileSize / hd) : 277 * tileSize;
			// scale and draw it //
			drawtex( i, 100 - ( wh >> 1 ), map[Math.floor(hy/ tileSize)][Math.floor(hx / tileSize)]-1, hid, wh, hd, theme );

			// start floor-casting //
			let tx, ty, j;
			let xr = 138.5 * tileSize * (_cos[a] / _cos[Math.floor(Math.abs(a-player.angle))]);
			let yr = 138.5 * tileSize * (_sin[a] / _cos[Math.floor(Math.abs(a-player.angle))]);
			const j0 = (wh >> 1) + 1;
			for (j = j0; j <= 100; j++) {
				tx = Math.floor(px + xr / j) % tileSize;
				ty = Math.floor(py + yr / j) % tileSize;
				dosemu.drawPixel(i, 99 + j, theme.fieldSprite.pixels[ty][tx]);
				if (false /* enableCeiling*/) {
					// let cofs = i+(maxy-(wh>>1))*320-32000;
					// buffer[cofs] = ceilling.pixels[ty][tx];
					// cofs -= 320;
				}
			}
		}

		a++;
	}
}

function getOrientationFromAngle(angle) {
	while (angle < 0) {
		angle += angle_360;
	}
	while (angle >= angle_360) {
		angle -= angle_360;
	}
	if (angle < angle_45) {
		return "right";
	}
	if (angle < angle_90 + angle_45) {
		return "down";
	}
	if (angle < angle_180 + angle_45) {
		return "left";
	} else if (angle < angle_270 + angle_45) {
		return "up";
	} else {
		return "right";
	}
}

/** @param {Player} player */
function movePlayer(player, angleOffset) {
	const orientations = ["right", "down", "left", "up"];
	const orientationIndex = (orientations.indexOf(getOrientationFromAngle(player.angle)) + angleOffset) % 4;
	player.move(orientations[orientationIndex]);
}

function handlePlayerInput(player, dt) {
	let move = false;
	let angleOffset = 0;
	if (dosemu.isKeyPressed('w')) {
		move = true;
	} else if (dosemu.isKeyPressed('s')) {
		move = true;
		angleOffset = 2;
	} else if (dosemu.isKeyPressed('a')) {
		move = true;
		angleOffset = 3;
	} else if (dosemu.isKeyPressed('d')) {
		move = true;
		angleOffset = 1;
	}
	if (move) {
		movePlayer(player, angleOffset);
	}

	if (dosemu.isKeyPressed("ArrowLeft")) {
		player.angle -= turn_speed * dt;
		while ( player.angle < 0 )
			player.angle += angle_360;
		while ( player.angle >= angle_360 )
			player.angle -= angle_360;
	}
	if (dosemu.isKeyPressed("ArrowRight")) {
		player.angle += turn_speed * dt;
		while ( player.angle < 0 )
			player.angle += angle_360;
		while ( player.angle >= angle_360 )
			player.angle -= angle_360;
	}
}
