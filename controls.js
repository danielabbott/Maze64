'use strict';

var key_down_up = false
var key_down_down = false
var key_down_left = false
var key_down_right = false

var user_has_interacted = false

function do_input() {
	if(game_complete || player_entity.dead) {
		return
	}

	if(key_down_up || key_down_right || key_down_left || key_down_down) {
		if(!player_entity.moving) {
			player_entity.animation_start_time = -1
		}
		player_entity.moving = true
		play_gravel_footsteps()

		if(key_down_up) {
			player_entity.facing = 'up'
		}
		else if(key_down_left) {
			player_entity.facing = 'left'
		}
		else if(key_down_right) {
			player_entity.facing = 'right'
		}
		else {
			player_entity.facing = 'down'			
		}
	}
	else {
		player_entity.moving = false
		stop_gravel_footsteps()
	}
}

function key_down_listener(e) {
	user_has_interacted = true

	if(game_complete) {
		key_down_up = true
		return
	}


	if(waiting_for_restart) {
		if(e.keyCode == 82) { // 'R'
			stop_all_sounds()
			all_entities = []
			all_projectiles = []
			keys_collected = 0
			game_complete = false
			game_over = false
			waiting_for_restart = false
			started_playing_death_music = false
			started_playing_win_music = false
			difficulty_select()
		}
		return
	}

	if(e.keyCode == 87 || e.keyCode == 38) {
		// up
		key_down_up = true
	}
	else if(e.keyCode == 65 || e.keyCode == 37) {
		// left
		key_down_left = true
	}
	else if(e.keyCode == 83 || e.keyCode == 40) {
		// down
		key_down_down = true
	}
	else if(e.keyCode == 68 || e.keyCode == 39) {
		// right
		key_down_right = true
	}
	else if(e.keyCode == 32) {
		// space
		player_has_attacked = true
	}
}

function key_up_listener(e) {
	if(game_complete) {
		return
	}
	if(e.keyCode == 87 || e.keyCode == 38) {
		// up
		key_down_up = false
	}
	else if(e.keyCode == 65 || e.keyCode == 37) {
		// left
		key_down_left = false
	}
	else if(e.keyCode == 83 || e.keyCode == 40) {
		// down
		key_down_down = false
	}
	else if(e.keyCode == 68 || e.keyCode == 39) {
		// right
		key_down_right = false
	}
	else if(e.keyCode == 77) {
		bgm_enabled = !bgm_enabled
		if(!bgm_enabled) {
			stop_bgm()
		}
	}
}