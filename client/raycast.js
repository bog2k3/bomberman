import { dosemu, dosemuSprite } from "../common/node_modules/dosemu/index.js";
import { Player } from "../common/player.js";
import { Entity } from "../common/entity.js";
import { Theme } from "./theme.js";
import * as constants from "../common/constants.js";
import { clamp } from "../common/math.js";

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
		_sin[i] = Math.sin( (i+0.5*0) * 2 * Math.PI / 1920 ) ;
		_cos[i] = Math.cos( (i+0.5*0) * 2 * Math.PI / 1920 ) ;
		_tan[i] = Math.tan( (i+0.5*0) * 2 * Math.PI / 1920 ) ;
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

/** @param {dosemuSprite.Sprite} tex */
function drawtex(x, y, tex, col, h, transparent = false) {
	if ( h < 1 ) return;
	const step = tileSize / h;
	let texRow = 0;
	if ( y < 0 ) {     // clip the texture if it's bigger than the screen //
		texRow = -step * y; // to draw only what is visible 					  //
		h = 200;
		y = 0;
	}
	for (let i = 0; i < h; i++) {
		const pxColor = tex.pixels[ Math.floor(texRow)][ col ];
		if (!transparent || pxColor != tex.transparent) {
			dosemu.drawPixel(x, y + i, pxColor);
		}
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
	const map_maxx = map[0].length * tileSize - 1;
	const map_maxy = map.length * tileSize - 1;

	const playerX = player.x; // [player.x] //
	const playerY = player.y - 3; // [player.y] //
	let a = Math.floor(player.angle - angle_30); // current ray's angle //
	const pxm = Math.floor(playerX / tileSize) * tileSize;
	const pxp = Math.floor(playerX / tileSize + 1) * tileSize;
	const pym = Math.floor(playerY / tileSize) * tileSize;
	const pyp = Math.floor(playerY / tileSize + 1) * tileSize;

	for (let i = 0; i <= maxx; i++) {
		while (a < 0) a += angle_360;
		while (a >= angle_360) a -= angle_360;

		let xHoriz, yHoriz, xVert, yVert;
		let xStep, yStep, distHoriz, distVert, texColumnHoriz, texColumnVert;

		let yOffs = 0;
		let xOffs = 0;

		// horizontal grids //

		if ( a == angle_180 || a == 0 ) {  // if the ray is goind paralel //
			distHoriz = 999999;     			   // with the walls, skip this   //
		} else {
			if ( a > angle_180 ) {			// is it goind up ? //
				yHoriz = pym;
				yOffs = -1;
				yStep = -tileSize;
			} else {						// or down ? //
				yHoriz = pyp;
				yStep = tileSize;
			}
			xHoriz = ( ( yHoriz - playerY ) / _tan[ a ] ) + playerX; // 1st intersection pt //
			xStep = yStep / _tan[ a ];				// deltaX / step 	   //

			do {
				if ( xHoriz < 0 || (yHoriz + yOffs) < 0 || xHoriz > map_maxx || yHoriz > map_maxy ) {
					distHoriz = 999999; // are we out of the map ? //
					break;
				}
				if ( map[ Math.floor((yHoriz + yOffs) / tileSize) ] [ Math.floor(xHoriz / tileSize) ] ) {
					distHoriz = ( yHoriz - playerY ) / _sin[ a ]; // did we hit a wall ? //
					texColumnHoriz = Math.floor(xHoriz) % tileSize; // if so, calculate the distance to the wall //
					// and the texture offset and jump out of the loop //
					break;
				}
				xHoriz += xStep; // no wall ? //
				yHoriz += yStep; // keep searching... //
			} while (1);
		}

		// verical grids //

		if ( a == angle_90 || a == angle_270 ) { // are we paralel ? //
			distVert = 999999;	// then there is no point searching for an intersection, is it ? //
		} else {
			if ( a > angle_90 && a < angle_270 ) { // is the ray going left ? //
				xVert = pxm;
				xOffs = -1;
				xStep = -tileSize;
			} else { 							   // or right ? //
				xVert = pxp;
				xStep = tileSize;
			}
			yVert = ( ( xVert - playerX ) * _tan[ a ] ) + playerY;
			yStep = xStep * _tan[ a ];

			do {
				if ( (xVert + xOffs) < 0 || yVert < 0 || xVert > map_maxx || yVert > map_maxy ) {
					distVert = 999999; // we're out of the map //
					break;
				}
				if ( map[ Math.floor(yVert / tileSize) ] [ Math.floor((xVert + xOffs) / tileSize) ] ) {
					distVert = ( xVert - playerX ) / _cos[ a ]; // a wall ! //
					texColumnVert = Math.floor(yVert) % tileSize; // get the distance and tex offset //
					break;
				}
				xVert += xStep; // keep going until we //
				yVert += yStep; // hit something or we get out of the map //
			} while (1);
		}

		if ( distHoriz > distVert ) { // see which of the walls is closer //
			distHoriz = distVert;
			texColumnHoriz = texColumnVert;
			xHoriz = xVert + xOffs;
			yHoriz = yVert;
		} else {
			yHoriz += yOffs;
		}

		// and finally draw the wall //
		// if it's not a fake wall (map-bound) //
		let wallHeight = 0;
		if ( distHoriz < 999999 ) {
			// remove fish-bowl defformation //
			distHoriz = distHoriz * _cos[ Math.floor(Math.abs( a - player.angle )) ];
			// calculate wall slice height //
			wallHeight = 290 * tileSize / (1 + distHoriz);
			// scale and draw it //
			const mapRow = Math.floor(yHoriz / tileSize);
			const mapCol = Math.floor(xHoriz / tileSize);
			if (map[mapRow][mapCol] > 0) {
				drawtex( i, 100 - wallHeight/2, theme.brickSprites[map[mapRow][mapCol]-1], texColumnHoriz, wallHeight);
			}
		}
		// start floor-casting //
		if (true) {
			let tx, ty, j;
			let xr = 145 * tileSize * (_cos[a] / _cos[Math.floor(Math.abs(a-player.angle))]);
			let yr = 145 * tileSize * (_sin[a] / _cos[Math.floor(Math.abs(a-player.angle))]);
			const j0 = Math.floor(wallHeight/2 + 1);
			for (j = j0; j <= 100; j++) {
				tx = Math.floor(playerX + xr / j) % tileSize;
				while (tx < 0) tx += tileSize;
				ty = Math.floor(playerY + yr / j) % tileSize;
				while (ty < 0) ty += tileSize;
				dosemu.drawPixel(i, 99 + j, theme.fieldSprite.pixels[ty][tx]);
				dosemu.drawPixel(i, 100 - j, 117);
			}
		}

		// check entities
		const spriteHits = [];
		for (let e of entities) {
			if (e instanceof Player) {
				continue;
			}
			const bbox = e.getBoundingBox();
			const spriteX = (bbox.left + bbox.right) / 2;
			const spriteY = (bbox.up + bbox.down) / 2;
			const sprite = e.get3DSprite();
			const distFromSpriteToRay = //Math.abs(
				_cos[a] * (playerY - spriteY) - _sin[a] * (playerX - spriteX)
			//);
			if (Math.abs(distFromSpriteToRay) < sprite.width / 2) {
				// we hit the sprite, hooray!!!
				const dx = spriteX - playerX;
				const dy = spriteY - playerY;
				const hitDistance = Math.sqrt(dx*dx + dy*dy);
				// check if the sprite is behind, and skip it if so:
				if (dx * _cos[a] + dy * _sin[a] < 0) {
					continue;
				}
				spriteHits.push({
					entity: e,
					sprite,
					spriteX,
					spriteY,
					distFromSpriteToRay,
					hitDistance
				});
			}
		}
		spriteHits.sort((a, b) => b.hitDistance - a.hitDistance);
		for (let spriteHit of spriteHits) {
			if (spriteHit.hitDistance >= distHoriz) {
				continue; // too distant, behind wall
			}
			// calculate sprite slice height //
			const spriteHeight = 290 * spriteHit.sprite.height / (1 + spriteHit.hitDistance)
			const spriteColumn = Math.floor(
				clamp(
					Math.abs(
						spriteHit.sprite.width / 2 - spriteHit.distFromSpriteToRay
					),
					0, spriteHit.sprite.width - 1
				)
			);
			// draw a slice of the sprite
			drawtex(i, 100 - spriteHeight / 2, spriteHit.sprite, spriteColumn, spriteHeight, true);
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
