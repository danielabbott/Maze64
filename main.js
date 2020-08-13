'use strict';

// Config

var PLAYER_ATTACK_COOLDOWN = 0.9

var key_positions = null
var keys_collected = 0

var c = null
var ctx = null
var maze_grid = null

var game_complete = false // player made it out
var game_over = false // player died
var game_over_time_of_death = 0 // so the player death animation has time to play before the fail screen
var waiting_for_restart = false // player is dead and has pressed 'R'
var started_playing_death_music = false
var started_playing_win_music = false

// 0 = easy, 1 = normal, 2 = hard
var difficulty = 0

var difficulty_textures = [easy, normal, hard]

function difficulty_select_key_listener(e) {
	if(e.keyCode == 32 || e.keyCode == 13) {
		window.removeEventListener("keyup", difficulty_select_key_listener, true);
		init()
		return
	}
	else if(e.keyCode == 38 || e.keyCode == 87) {
		difficulty -= 1
		if(difficulty < 0) difficulty=2
	}
	else if(e.keyCode == 40 || e.keyCode == 83) {
		difficulty = (difficulty+1) % 3
	}
	drawImage(difficulty_textures[difficulty], 0,0,64,64)

	if(difficulty == 0) {
		set_maze_size(5)
	}
	else {
		set_maze_size(7)
	}
}

function difficulty_select() {
	c = document.getElementById("canv");
	ctx = c.getContext("2d",{alpha:false});

	get_viewport_dimensions()
	set_hud_transform()

	difficulty = Math.floor(difficulty % 3)

	drawImage(difficulty_textures[difficulty], 0,0,64,64)

	window.addEventListener("keyup", difficulty_select_key_listener, true);
}

function init() {
	c = document.getElementById("canv");
	ctx = c.getContext("2d",{alpha:false});
	var m = create_maze()
	key_positions = m.key_positions
	maze_grid = m.maze_grid
	add_player();
	create_enemies();


	window.addEventListener("keydown", key_down_listener, true);
	window.addEventListener("keyup", key_up_listener, true);
	window.requestAnimationFrame(gameLoop);
}


var border_left = 0
var border_right = 0
var border_top = 0
var border_bottom = 0

var viewport_x = 0
var viewport_y = 0
var viewport_width = 0
var viewport_height = 0

var canvas_scale_x = 0
var canvas_scale_y = 0

function get_viewport_dimensions() {

	// c.width and c.height are in physical pixel units
	c.width = c.clientWidth * window.devicePixelRatio;
	c.height = c.clientHeight * window.devicePixelRatio;

	var width_excess = c.width % 64
	var height_excess = c.height % 64

	border_left = Math.floor(width_excess/2)
	border_right = width_excess - border_left
	border_top = Math.floor(height_excess/2)
	border_bottom = height_excess - border_right

	viewport_x = border_left
	viewport_y = border_top
	viewport_width = c.width - width_excess
	viewport_height = c.height - height_excess



	canvas_scale_x = viewport_width/64.0
	canvas_scale_y = viewport_height/64.0

	var vpx = Math.floor(actual_view_pos[0])
	var vpy = Math.floor(actual_view_pos[1])

	var canvas_translation_x = border_left - vpx*canvas_scale_x
	var canvas_translation_y = border_top - vpy*canvas_scale_y
	ctx.setTransform(canvas_scale_x, 0, 0, canvas_scale_y, canvas_translation_x, canvas_translation_y);

	ctx.mozImageSmoothingEnabled    = false;
	ctx.oImageSmoothingEnabled      = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled     = false;
	ctx.imageSmoothingEnabled       = false;
}

function set_hud_transform() {
	ctx.setTransform(canvas_scale_x, 0, 0, canvas_scale_y, border_left, border_top);
}

function draw_borders() {
	// Set borders to dark grey
	ctx.setTransform(1.0, 0, 0, 1.0, 0.0, 0.0);
	ctx.fillStyle  = '#000000'
	ctx.fillRect(0, 0, c.width, border_top); // top
	ctx.fillRect(0, 0, border_left, c.height); // left
	ctx.fillRect(border_left+viewport_width, 0, border_right, c.height); // right
	ctx.fillRect(0, border_top+viewport_height, c.width, border_bottom); // bottom
}

function drawImage(img, x, y, w, h) {
	ctx.drawImage(img, Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}


function drawImage(img, x, y) {
	ctx.drawImage(img, Math.floor(x), Math.floor(y));
}

function drawSubImage(img, img_x, img_y, img_w, img_h, x, y, w, h) {
	ctx.drawImage(img, Math.floor(img_x), Math.floor(img_y), Math.floor(img_w), Math.floor(img_h), Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function clamp(x, min, max) {
	return Math.min(Math.max(x, min), max);
}

// Position of view in world space (measured in game pixels, relative to top left of map)
var view_pos = [192,384]
var actual_view_pos = view_pos

var start_time_ms = 0;
var last_frame_time = 0;

// Set to true when space bar has been pressed
var player_has_attacked = false
var player_attack_cooldown_ends = 0

var last_health_regen_time = 0

function gameLoop(now) {

	/* Frame rate and delta time */
	if(start_time_ms == 0) {
		start_time_ms = now;
		last_frame_time = -34/1000.0;
	}
	now -= start_time_ms;
	now /= 1000.0;
	var delta_time = (now - last_frame_time);


	if(delta_time < 30/1000) {
		window.requestAnimationFrame(gameLoop);
		return;
	}

	if(game_complete && player_entity.y < -40) {
		if(!started_playing_win_music) {
			started_playing_win_music = true
			stop_all_sounds()
			play_win_music()
		}
		set_hud_transform()
		drawImage(youwin, 0, 0, 64, 64)
		overlay.style.backgroundColor = '#ffffff00'
		return
	}
	else if(game_over && now-game_over_time_of_death >= 1.3) {
		set_hud_transform()
		if(!started_playing_death_music) {
			started_playing_death_music = true
			stop_all_sounds()
			play_death_music()
		}
		if(now-game_over_time_of_death >= 5) {
			drawImage(fail2, 0, 0, 64, 64)
			waiting_for_restart = true
		}
		else {
			drawImage(fail1, 0, 0, 64, 64)
			window.requestAnimationFrame(gameLoop);
		}
		return
	}

	do_input()

	move_entities(now, delta_time)
	check_key_collisions()


	if(player_has_attacked) {
		if(player_attack_cooldown_ends <= now) {
			player_do_attack(now)
			player_attack_cooldown_ends = now+PLAYER_ATTACK_COOLDOWN
		}
		player_has_attacked = false
	}

	view_pos[0] = clamp(player_entity.x + player_entity.w/2 - 32, 0, WORLD_SIZE-64)

	if(game_complete && player_entity.y < 0) {
		view_pos[1] = player_entity.y
	} else {
		view_pos[1] = clamp(player_entity.y + player_entity.h/2 - 32, 0, WORLD_SIZE-64)
	}

	actual_view_pos = apply_shake(view_pos, now)
	actual_view_pos[0] = actual_view_pos[0]
	if(!game_complete) {
		actual_view_pos[1] = clamp(actual_view_pos[1], 0, WORLD_SIZE-64)
	}

	var max_entities = [Math.floor(MAZE_GRID_SIZE*1.3), MAZE_GRID_SIZE*2, MAZE_GRID_SIZE*2]
	if(!game_complete && all_entities.length < max_entities[difficulty]) {
		spawn_random_enemy()
	}

	if(difficulty == 0 && now-last_health_regen_time >= 10) {
		last_health_regen_time = now
		player_entity.health = clamp(player_entity.health+0.5, 0, player_entity.max_health)
	}

	get_viewport_dimensions()

	ctx.fillStyle  = '#000000'
	// ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

	draw_gravel();

	draw_hedge_shadows()
	draw_keys()

	move_projectiles(now, delta_time)
	do_entity_ai_and_animations(now, delta_time)

	// Entities in y-ascending order
	var entities_sorted = get_entites_sorted()
	var entities_list_index = 0


	for (var i = 0; i < entities_sorted.length; i++) {
		var e = entities_sorted[i]
		draw_entity(now, e)
	}

	draw_hedges()
	draw_projectiles()

	entities_sorted.forEach(function(e){redraw_entity_over_hedge_shadow(now,e)})


	render_hud()

	draw_borders()

	update_sound(now)



	if(game_complete) {
		var alpha = clamp(Math.floor(((-player_entity.y) / 40) * 255), 0, 255)
		var alpha_string = alpha.toString(16).padStart(2, '0')
		overlay.style.backgroundColor = '#ffffff' + alpha_string
	}

	last_frame_time = now
	window.requestAnimationFrame(gameLoop);
}

window.onload = difficulty_select
