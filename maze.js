'use strict';

var WORLD_SIZE = 7*64 // Measured in in-game pixel units
var MAZE_PATH_WIDTH = 14 // Must be even
var MAZE_GRID_SIZE = Math.ceil(WORLD_SIZE / MAZE_PATH_WIDTH)

// i = 5 or 7
function set_maze_size(i) {
	WORLD_SIZE = i*64
	MAZE_GRID_SIZE = Math.ceil(WORLD_SIZE / MAZE_PATH_WIDTH)
}

function move(pos, dir) {
	if(dir == 'up') {
		pos[1] -= 1
	}
	else if(dir == 'down') {
		pos[1] += 1
	}
	else if(dir == 'left') {
		pos[0] -= 1
	}
	else if(dir == 'right') {
		pos[0] += 1
	}
}

function pick_random(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function pick_random_weighted(arr, towards) {
	if(Math.random() < 0.8) {
		return towards;
	}

	return arr[Math.floor(Math.random() * arr.length)];
}

// Changes direction if path is about to enter the outer edge of the maze
function make_direction_valid(pos, dir) {
	if(dir == 'up') {
		if(pos[1] == 1) {
			if(pos[0] == 1) {
				return pick_random(['right', 'down'])
			}
			if(pos[0] == MAZE_GRID_SIZE-2) {
				return pick_random(['left', 'down'])
			}
			return pick_random(['left', 'right', 'down'])
		}
	}
	else if(dir == 'down') {
		if(pos[1] == MAZE_GRID_SIZE-2) {
			if(pos[0] == 1) {
				return pick_random(['right', 'up'])
			}
			if(pos[0] == MAZE_GRID_SIZE-2) {
				return pick_random(['left', 'up'])
			}
			return pick_random(['left', 'right', 'up'])
		}
	}
	else if(dir == 'left') {
		if(pos[0] == 1) {
			if(pos[1] == 1) {
				return pick_random(['down', 'right'])
			}
			if(pos[1] == MAZE_GRID_SIZE-2) {
				return pick_random(['right', 'up'])
			}
			return pick_random(['down', 'right', 'up'])
		}
	}
	else if(dir == 'right') {
		if(pos[0] == MAZE_GRID_SIZE-2) {
			if(pos[1] == 1) {
				return pick_random(['down', 'left'])
			}
			if(pos[1] == MAZE_GRID_SIZE-2) {
				return pick_random(['left', 'up'])
			}
			return pick_random(['down', 'left', 'up'])
		}
	}
	return dir
}

function create_maze_template() {
	var maze_grid = new Array(MAZE_GRID_SIZE);


	for (var i = 0; i < MAZE_GRID_SIZE; i++) {
	  	maze_grid[i] = new Array(MAZE_GRID_SIZE).fill(false);
	}

	return maze_grid
}

function add_path(maze_grid, start_position, end_position) {

	var direction = pick_random(['down', 'left', 'up', 'right'])
	var current_position = [start_position[0], start_position[1]]

	while(current_position[0] != end_position[0] || current_position[1] != end_position[1]) {
		maze_grid[current_position[0]][current_position[1]] = true

		if(Math.random() < 0.7) {
			// Move in different direction

			var best_direction = 'down';
			if(end_position[0] - current_position[0] > 0) {
				best_direction = 'right';
			}
			else if(end_position[0] - current_position[0] < 0) {
				best_direction = 'left';
			}
			if(end_position[1] - current_position[1] > 0) {
				best_direction = 'down';
			}
			else if(end_position[1] - current_position[1] < 0) {
				best_direction = 'up';
			}


			direction = pick_random_weighted(['down', 'left', 'right', 'up'], best_direction)
		}

		direction = make_direction_valid(current_position, direction)

		move(current_position, direction)
	}
}

// Weighted towards edges (1 and MAZE_GRID_SIZE-2)
function random_weighted_coordinate() {
	var x = Math.random()
	x = x*x
	return 1+Math.floor(x*(MAZE_GRID_SIZE-2))
}

function random_coordinate() {
	return 1+Math.floor(Math.random()*(MAZE_GRID_SIZE-2))
}

// false = hedge, true = path
function create_maze() {
	var maze_grid = create_maze_template()
	var key_positions = [[random_coordinate(),random_coordinate()],
	[random_coordinate(),random_coordinate()],
	[random_coordinate(),random_coordinate()]]
	key_positions[1][1] = random_coordinate()
	random_coordinate()
	random_coordinate()
	random_coordinate()
	key_positions[2][0] = random_coordinate()

	

	/* Path from start to finish */

	maze_grid[Math.floor(MAZE_GRID_SIZE/2)][0] = true
	maze_grid[Math.floor(MAZE_GRID_SIZE/2)][1] = true
	maze_grid[Math.floor(MAZE_GRID_SIZE/2)][MAZE_GRID_SIZE-2] = true

	var player_start_position = [Math.floor(MAZE_GRID_SIZE/2), (MAZE_GRID_SIZE-3)]

	var start_position = player_start_position
	var end_position = [1+Math.floor(Math.random()*(MAZE_GRID_SIZE-2)), 1+Math.floor(Math.random()*(MAZE_GRID_SIZE-2))]


	add_path(maze_grid, start_position, end_position)

	start_position = end_position
	end_position = [Math.floor(MAZE_GRID_SIZE/2), 1]
	add_path(maze_grid, start_position, end_position)

	/* paths leading to keys */

	for(var i = 0; i < 3; i++) {
		var start_position = player_start_position
		var end_position = key_positions[i]
		maze_grid[key_positions[i][0]][key_positions[i][1]] = true
		add_path(maze_grid, start_position, end_position)
	}

	/* Extra paths */

	for(var i = 0; i < 16; i++) {
		var start_position = [random_weighted_coordinate(), random_weighted_coordinate()]
		var end_position = [random_weighted_coordinate(), random_weighted_coordinate()]
		add_path(maze_grid, start_position, end_position)
	}

	return {
		maze_grid: maze_grid,
		key_positions: key_positions
	}
}

function create_enemies() {
	for(var x = 1; x < MAZE_GRID_SIZE-1; x++) {
		var on_row = 0;
		for(var i = 0; i < 5 && on_row < 2; i++) {
			var y = 1 + Math.floor(Math.random() * (MAZE_GRID_SIZE-2))

			// Enemies don't spawn near the player start position
			if(y >= MAZE_GRID_SIZE-3 && x >= (MAZE_GRID_SIZE/2)-3 && x <= (MAZE_GRID_SIZE/2)+3) {
				continue
			}

			if(maze_grid[x][y]) {
				var e = add_enemy_a(x*MAZE_PATH_WIDTH+1 + Math.floor(Math.random()*3), y*MAZE_PATH_WIDTH+1 + Math.floor(Math.random()*2));
				e.moving = true
				e.facing = pick_random_direction()
				on_row += 1
			}
		}
	}
}

function pick_random_direction() {
	return pick_random(['up', 'down', 'right', 'left'])
}