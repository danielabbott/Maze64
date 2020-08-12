'use strict';

function draw_gravel() {
	for (var i = 0; i < WORLD_SIZE/64; i++) {
		for (var j = 0; j < WORLD_SIZE/64; j++) {
			drawImage(gravel, i*64, j*64, 64, 64)
		}
	}
	drawImage(keys_collected >= 3 ? gateopen:gateclosed, Math.floor(MAZE_GRID_SIZE/2)*MAZE_PATH_WIDTH, 0, 14, 14)
	drawImage(victory, Math.floor((WORLD_SIZE/64)/2)*64+4+(player_entity.x%MAZE_PATH_WIDTH), -64, 64, 64)
	// I don't know why the +4+(player_entity.x%MAZE_PATH_WIDTH) is needed but it works.
}

function draw_hedge_shadows() {
	for (var j = 0; j < MAZE_GRID_SIZE; j++) {
		for (var i = 0; i < MAZE_GRID_SIZE; i++) {
			if(maze_grid[i][j]) {
				if(i > 0 && j > 0 && !maze_grid[i-1][j] && !maze_grid[i][j-1]) {
					ctx.fillStyle = '#0b401660'
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH, 2, 1)
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+1, 1, 1)
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+2, 1, 1)
					ctx.fillRect(i*MAZE_PATH_WIDTH+1, j*MAZE_PATH_WIDTH+1, 1, 1)
				}
				if(i < MAZE_GRID_SIZE-1 && j > 0 && !maze_grid[i+1][j] && !maze_grid[i][j-1]) {
					ctx.fillRect((i+1)*MAZE_PATH_WIDTH-2, j*MAZE_PATH_WIDTH, 2, 1)
					ctx.fillRect((i+1)*MAZE_PATH_WIDTH-1, j*MAZE_PATH_WIDTH+1, 1, 1)
					ctx.fillRect((i+1)*MAZE_PATH_WIDTH-1, j*MAZE_PATH_WIDTH+2, 1, 1)
					ctx.fillRect((i+1)*MAZE_PATH_WIDTH-2, j*MAZE_PATH_WIDTH+1, 1, 1)
				}
			}
			else {
				
				var path_below = j < MAZE_GRID_SIZE-1 && maze_grid[i][j+1]

				if(i < MAZE_GRID_SIZE-1 && maze_grid[i+1][j]) {
					// Path to the right of this, add anti-aliasing
					ctx.fillStyle = '#0b501640'
					ctx.fillRect(i*MAZE_PATH_WIDTH+MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH, 1, path_below ? 11 : MAZE_PATH_WIDTH)
				}

				if(i > 0 && maze_grid[i-1][j]) {
					// Path to the left of this, add anti-aliasing
					ctx.fillStyle = '#0b501640'
					ctx.fillRect(i*MAZE_PATH_WIDTH-1, j*MAZE_PATH_WIDTH, 1, path_below ? 11 : MAZE_PATH_WIDTH)
				}

				if(j > 0 && maze_grid[i][j-1]) {
					// Path to the top of this, add anti-aliasing
					ctx.fillStyle = '#0b501620'
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH-1, MAZE_PATH_WIDTH, 1)
				}

				if(path_below) {
					// Path below this, add shadow

					
					// Shadow on path
					ctx.fillStyle = '#24382950'
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+MAZE_PATH_WIDTH, MAZE_PATH_WIDTH, 2)
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+MAZE_PATH_WIDTH, MAZE_PATH_WIDTH, 1)

				}
			}
		}
	}
}

function draw_hedges() {
	for (var j = 0; j < MAZE_GRID_SIZE; j++) {
		for (var i = 0; i < MAZE_GRID_SIZE; i++) {
			if(maze_grid[i][j]) {
				
			}
			else {
				drawSubImage(hedge, (i*MAZE_PATH_WIDTH)%448, (j*MAZE_PATH_WIDTH)%448, MAZE_PATH_WIDTH, MAZE_PATH_WIDTH, i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH, MAZE_PATH_WIDTH, MAZE_PATH_WIDTH)

				var path_below = j < MAZE_GRID_SIZE-1 && maze_grid[i][j+1]


				if(path_below) {
					// Path below this, add shadow

					// Shadow on hedge
					ctx.fillStyle = '#0b4016a0'
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+0, MAZE_PATH_WIDTH, (MAZE_PATH_WIDTH/2))
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+1, MAZE_PATH_WIDTH, (MAZE_PATH_WIDTH/2)-1)
					ctx.fillStyle = '#0b4016ff'
					ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+3, MAZE_PATH_WIDTH, (MAZE_PATH_WIDTH/2)-3)


					// Corners
					if(i > 0 && j > 0 && !maze_grid[i-1][j] && !maze_grid[i-1][j+1]) {
						ctx.fillStyle = '#1b6d2ef0'
						ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+0, 2, 1)
						ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+1, 1, 1)
						ctx.fillStyle = '#1c622f50'
						ctx.fillRect(i*MAZE_PATH_WIDTH, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+2, 1, 1)
						ctx.fillRect(i*MAZE_PATH_WIDTH+1, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+1, 1, 1)
					}
					if(i < MAZE_GRID_SIZE-1 && j > 0 && !maze_grid[i+1][j] && !maze_grid[i+1][j+1]) {
						ctx.fillStyle = '#1b6d2ef0'
						ctx.fillRect((i+1)*MAZE_PATH_WIDTH-2, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+0, 2, 1)
						ctx.fillRect((i+1)*MAZE_PATH_WIDTH-1, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+1, 1, 1)
						ctx.fillStyle = '#1c622f50'
						ctx.fillRect((i+1)*MAZE_PATH_WIDTH-1, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+2, 1, 1)
						ctx.fillRect((i+1)*MAZE_PATH_WIDTH-2, j*MAZE_PATH_WIDTH+(MAZE_PATH_WIDTH/2)+1, 1, 1)
					}
				}
			}
		}
	}
}

var key_texture_width = 10
var key_texture_height = 6

function get_key_pos(p) {
	return [p[0] * MAZE_PATH_WIDTH + (MAZE_PATH_WIDTH-key_texture_width)*0.5, p[1] * MAZE_PATH_WIDTH + (MAZE_PATH_WIDTH-key_texture_height)*0.5]
}

function check_key_collisions() {
	for(var i = 0; i < key_positions.length; i++) {
		var p = get_key_pos(key_positions[i])

		if(player_entity.x < p[0]+key_texture_width && player_entity.x+player_entity.w >= p[0]) {
			if(player_entity.y < p[1]+key_texture_height && player_entity.y+player_entity.h >= p[1]) {
				keys_collected += 1
				key_positions.splice(i, 1)
				play_key_sound()
			}
		}
	}
}

function draw_keys() {
	key_positions.forEach(function(p_){
		var p = get_key_pos(p_)
		drawImage(key, p[0], p[1])
	})
}