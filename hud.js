'use strict';

function render_hud() {
	set_hud_transform();

	// Darken edges of viewport

	drawImage(dark, 0, 0, 64, 64)

	if(difficulty == 0) {
		// Pointer to nearest key
		draw_key_pointer()
	}

	// keys
	x = 1
	for(var i = 0; i < keys_collected; i++) { 
		drawImage(key, x, 64-6-1)
		x += 10+1
	}
	for(var i = 0; i < 3-keys_collected; i++) { 
		drawImage(nokey, x, 64-6-1)
		x += 10+1
	}

	// Health

	if(player_entity.max_health < 1) {
		return
	}

	var x = 64-1-3*6
	var health = player_entity.health

	// Full hearts
	if(health > 0.5) {
		for(var i = 0; i <= health-1; i++) {
			drawImage(heart, x, 1)
			x += 5+1
		}
	}

	// Half heart
	if(health % 1.0 != 0) {
		drawImage(heart_half, x, 1)
		x += 5+1
	}

	// Black hearts
	for(var i = 0; i < Math.floor(player_entity.max_health - health); i++) {
		drawImage(heart_gone, x, 1)
		x += 5+1
	}
}

function draw_key_pointer() {
	var key = null

	var x = player_entity.x
	var y = player_entity.y

	if(key_positions.length >= 1) {
		var nearest_key_distance = 9999999
		var nearest_key_i = 0

		for(var i = 0; i < key_positions.length; i++) {
			var p = [key_positions[i][0]*MAZE_PATH_WIDTH, key_positions[i][1]*MAZE_PATH_WIDTH]
			var d = (p[0]-x)*(p[0]-x) + (p[1]-y)*(p[1]-y)
			if(d < nearest_key_distance) {
				nearest_key_distance = d
				nearest_key_i = i
			}
		}
		key = [key_positions[nearest_key_i][0]*MAZE_PATH_WIDTH, key_positions[nearest_key_i][1]*MAZE_PATH_WIDTH]
	
	}
	else {
		// gate position
		key = [Math.floor(MAZE_GRID_SIZE/2)*MAZE_PATH_WIDTH, 0]
	}

	if(key[0]+key_texture_width >= actual_view_pos[0] && key[0] < actual_view_pos[0]+64
		&& key[1]+key_texture_height >= actual_view_pos[1] && key[1] < actual_view_pos[1]+64) {
		// key in view
	}
	else {
		var right_left = null
		var up_down = null
		if(key[0]-x > 5) {
			right_left = 'right'
		}
		else if(key[0]-x < -5) {
			right_left = 'left'
		}
		if(key[1]-y > 5) {
			up_down = 'down'
		}
		else if(key[1]-y < -5) {
			up_down = 'up'
		}

		if(right_left == null && up_down == null) {
			return
		}

		ctx.fillStyle  = '#edde32'


		if(up_down == null) {
			if(right_left == 'left') {
				ctx.fillRect(0, 31, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(1, 30, 1, 1);
				ctx.fillRect(1, 32, 1, 1);
			}
			else {
				ctx.fillRect(63, 31, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(62, 30, 1, 1);
				ctx.fillRect(62, 32, 1, 1);
			}
		}
		else if (right_left == null) {
			if(up_down == 'up') {
				ctx.fillRect(31, 0, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(30, 1, 1, 1);
				ctx.fillRect(32, 1, 1, 1);
			}
			else {
				ctx.fillRect(31, 63, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(30, 62, 1, 1);
				ctx.fillRect(32, 62, 1, 1);
			}
		}
		else {
			// Corners

			if(up_down == 'up' && right_left == 'left') {
				ctx.fillRect(0, 0, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(1, 0, 1, 1);
				ctx.fillRect(0, 1, 1, 1);
			}
			else if(up_down == 'up' && right_left == 'right') {
				ctx.fillRect(63, 0, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(62, 0, 1, 1);
				ctx.fillRect(63, 1, 1, 1);
			}
			else if(up_down == 'down' && right_left == 'left') {
				ctx.fillRect(0, 63, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(1, 63, 1, 1);
				ctx.fillRect(0, 62, 1, 1);
			}
			else if(up_down == 'down' && right_left == 'right') {
				ctx.fillRect(63, 63, 1, 1);
				ctx.fillStyle  = '#d4c624'
				ctx.fillRect(62, 63, 1, 1);
				ctx.fillRect(63, 62, 1, 1);
			}
		}
	}
}