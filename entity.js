'use strict';

var all_entities = []
var all_projectiles = []
var player_entity = {}

function add_player() {
	var health = ([3, 3, 0.5])[difficulty]
	player_entity = {
		type: 'player',
		x: Math.floor(MAZE_GRID_SIZE/2) * MAZE_PATH_WIDTH +  1,
		y: WORLD_SIZE-MAZE_PATH_WIDTH-1-12,
		w: 8,
		h: 12,
		speed: 12.0, // pixels per second
		max_health: health, // in hearts
		health: health,
		front_idle: character_front_idle,
		front_walk: [character_front_walk1, character_front_walk2],
		back_idle: character_back_idle,
		back_walk: [character_back_walk1, character_back_walk2],
		right_idle: character_right_idle,
		right_walk: [character_right_walk1, character_right_walk2, character_right_walk4, character_right_walk3, character_right_walk4, character_right_walk2],
		left_idle: character_left_idle,
		left_walk: [character_left_walk1, character_left_walk2, character_left_walk4, character_left_walk3, character_left_walk4, character_left_walk2],
		attack_down: character_attack_front,
		attack_up: character_attack_back,
		attack_right: character_attack_right,
		attack_left: character_attack_left,
		death: [cdeath1, cdeath2, cdeath3, cdeath4],
		animation_start_time: 0,
		moving: false,
		facing: 'down',
		attacking: false,
		dead: false
	};
	all_entities.push(player_entity)
}

// x,y are the CENTRE of the sprite
function add_enemy_a(x, y) {
	var w = 8
	var h = 14
	var e = {
		type: 'enemy',
		// Move coords from centre to top left
		x: x-w/2,
		y: y-h/2,
		w: w,
		h: h,
		speed: 6.0, // pixels per second
		max_health: 1.5, // in hearts
		health: 1.5,
		front_idle: enemy_a_front_idle,
		front_walk: [enemy_a_front_idle, enemy_a_front_walk1, enemy_a_front_walk2, enemy_a_front_walk3],
		back_idle: enemy_a_back_idle,
		back_walk: [enemy_a_back_idle, enemy_a_back_walk1, enemy_a_back_walk2, enemy_a_back_walk3],
		right_idle: enemy_a_right_idle,
		right_walk: [enemy_a_right_idle, enemy_a_right_walk1, enemy_a_right_walk2, enemy_a_right_walk3, enemy_a_right_walk4, enemy_a_right_walk5, enemy_a_right_walk6, enemy_a_right_walk7],
		left_idle: enemy_a_left_idle,
		left_walk: [enemy_a_left_idle, enemy_a_left_walk1, enemy_a_left_walk2, enemy_a_left_walk3, enemy_a_left_walk4, enemy_a_left_walk5, enemy_a_left_walk6, enemy_a_left_walk7],
		attack_right: enemy_a_attack_right,
		attack_left: enemy_a_attack_left,
		attack_down: enemy_a_attack_front,
		attack_up: enemy_a_attack_back,
		death: [enemy_a_death1, enemy_a_death2, enemy_a_death3, enemy_a_death4, enemy_a_death5],
		animation_start_time: 0,
		attack_cooldown_time: 0,
		change_direction_cooldown_time: 0,
		moving: false,
		facing: 'right',
		attacking: false,
		dead: false
	};
	all_entities.push(e)
	return e
}

// Entities in y-ascending order, projectiles first
function get_entites_sorted() {
	all_entities.sort(function (a,b) {
		return (a.y+a.h)-(b.y+b.h)
	})
	return all_entities
}

// Rows are 10 pixels tall (1 path width)
function entity_is_on_row(row, e) {
	var y = e.y + e.h
	return y >= row*MAZE_PATH_WIDTH && y < (row+1)*MAZE_PATH_WIDTH;
}

function draw_entity(now, e) {
	draw_entity_part(now, e, 0, 0, e.w, e.h)
}


function draw_entity_part(now, e, tx, ty, tw, th) {
	if(e.type == 'projectile') {
		draw_projectile_part(e, tx, ty, tw, th)
		return
	}

	var img = e.front_idle

	if(e.health <= 0) {
		// Dead (F)

		if(now - e.animation_start_time >= 1.0) {
			return
		}

		var frame_index = Math.floor(((now - e.animation_start_time) % 1.0) * e.death.length)
		img = e.death[frame_index]
	}
	else {

		if(e.moving && e.animation_start_time < 0) {
			e.animation_start_time = now
		}
		

		if(e.facing == 'up') {
			img = e.back_idle
			if(e.attacking) {
				img = e.attack_up
			}
			else if(e.moving) {
				var frame_index = Math.floor(((now - e.animation_start_time) % 1.0) * e.back_walk.length)
				img = e.back_walk[frame_index]
			}
		}
		else if (e.facing == 'down') {
			if(e.attacking) {
				img = e.attack_down
			}
			else if(e.moving) {
				var frame_index = Math.floor(((now - e.animation_start_time) % 1.0) * e.front_walk.length)
				img = e.front_walk[frame_index]
			}
		}	

		else if (e.facing == 'right') {
			img = e.right_idle
			if(e.attacking) {
				img = e.attack_right
			}
			else if(e.moving) {
				var anim_speed = e.type == 'player' ? 0.8 : 1.0
				var frame_index = Math.floor((((now - e.animation_start_time)*0.8) % 1.0) * e.right_walk.length)
				img = e.right_walk[frame_index]
			}
		}	
		else if (e.facing == 'left') {
			img = e.left_idle
			if(e.attacking) {
				img = e.attack_left
			}
			else if(e.moving) {
				var frame_index = Math.floor((((now - e.animation_start_time)*0.8) % 1.0) * e.left_walk.length)
				img = e.left_walk[frame_index]
			}
		}
	}

	drawSubImage(img, tx, ty, tw, th, e.x+tx, e.y+ty, tw, th)
}

function do_entity_or_projectile_movement(e, delta_time) {
	if(e.moving) {
		if(e.facing == 'up') {
			e.y -= delta_time * e.speed
		}
		else if(e.facing == 'down') {
			e.y += delta_time * e.speed
		}
		else if(e.facing == 'left') {
			e.x -= delta_time * e.speed
		}
		else {
			e.x += delta_time * e.speed
		}
	}
	e.x = clamp(e.x, 0, WORLD_SIZE - e.w - MAZE_PATH_WIDTH)

	if(!game_complete || e != player_entity) {
		e.y = clamp(e.y, 0, WORLD_SIZE - e.h - MAZE_PATH_WIDTH)
	}
}

function move_entities(now, delta_time) {

	for(var i = 0; i < all_entities.length; i++) {
		var e = all_entities[i]

		if(e.attacking || e.health <= 0) {
			continue
		}

		var old_x = e.x
		var old_y = e.y

		do_entity_or_projectile_movement(e, delta_time)

		var mx = Math.floor(e.x/MAZE_PATH_WIDTH)

		if(!game_complete && e.type == 'player' && keys_collected >= 3 && e.y <= MAZE_PATH_WIDTH
				&& e.x >= Math.floor(MAZE_GRID_SIZE/2)*MAZE_PATH_WIDTH+1
				&& e.x+e.w < Math.floor(MAZE_GRID_SIZE/2)*MAZE_PATH_WIDTH+MAZE_PATH_WIDTH) {
			game_complete = true
			// kill all enemies
			all_entities.forEach(function(e2) {
				if(e2.type == 'enemy') {
					kill_entity(e2, now)
				}
			})
		}

		if(!game_complete && !entity_position_valid(e)) {
			e.x = old_x
			e.y = old_y

			if(e.type == 'enemy') {
				e.facing = pick_random_direction()
				e.change_direction_cooldown_time = now+2

				if(!entity_position_valid(e)) {
					// Entity is stuck
					all_entities.splice(i, 1)
				}
			}
		}

		if(e.type == 'enemy' && e.y+e.h >= WORLD_SIZE-2) {
			e.facing = 'up'
		}
	}
	

}

// Returns false if the entity is stood inside a hedge
function entity_position_valid(e) {
	if(e.x > WORLD_SIZE-MAZE_PATH_WIDTH-e.w) return false
	if(e.y > WORLD_SIZE-MAZE_PATH_WIDTH-e.h) return false

	var not_on_path = false

	if(!maze_grid[Math.floor((e.x) / MAZE_PATH_WIDTH)][Math.floor((e.y+e.h-5) / MAZE_PATH_WIDTH)]) {
		not_on_path = true
	}

	if(!maze_grid[Math.floor((e.x+e.w-1) / MAZE_PATH_WIDTH)][Math.floor((e.y+e.h-5) / MAZE_PATH_WIDTH)]) {
		not_on_path = true
	}

	if(!not_on_path) {
		return true
	}

	// Check if partially hidden behind hedge
	
	var head_is_over_path1 = maze_grid[Math.floor((e.x) / MAZE_PATH_WIDTH)][Math.floor((e.y+e.h-5) / MAZE_PATH_WIDTH)]
	var head_is_over_path2 = maze_grid[Math.floor((e.x+e.w+1) / MAZE_PATH_WIDTH)][Math.floor((e.y+e.h-5) / MAZE_PATH_WIDTH)]
	if(head_is_over_path1 && head_is_over_path2) {
		return true
	}
	return false
}

function quick_distance(e, e2) {
	var x = Math.abs(e.x-e2.x)
	var y = Math.abs(e.y-e2.y)
	return x*x + y*y
}

function do_entity_ai_and_animations(now, delta_time) {
	var enemies_near_player = false
	var enemies_in_attack_range = false

	var smallest_enemy_distance = 9999

	for(var i = 0; i < all_entities.length; i++) {
		var e = all_entities[i]



		if(e.health <= 0 && now - e.animation_start_time >= 1) {
			all_entities.splice(i,1)
			continue
		}


		if(e.type == 'enemy' && !e.dead) {
			var dist = quick_distance(player_entity, e)
			if(dist < smallest_enemy_distance) {
				smallest_enemy_distance = dist
			}


			if(e.attacking) {
				if(now - e.animation_start_time >= 0.5) {
					e.attacking = false
					e.attack_cooldown_time = now+0.5
				}
			}
			else if(!game_complete && !game_over && 
					e.attack_cooldown_time <= now && quick_distance(e, player_entity) < 6*6) {
				enemies_in_attack_range = true
				e.attacking = true
				e.animation_start_time = now
				player_entity.health -= 0.5
				play_hurt_sound()
				start_shake(now)
				if(player_entity.health <= 0) {
					kill_entity(player_entity, now)
					game_over = true
					game_over_time_of_death = now
				}
			}
			else if(quick_distance(e, player_entity) > 4*4 && quick_distance(e, player_entity) < 35*35
				&& e.change_direction_cooldown_time <= now){
				// Walk towards player

				var dx = e.x - player_entity.x
				var dy = e.y - player_entity.y

				var old_facing = e.facing

				if((Math.abs(dx) > Math.abs(dy)) || (Math.abs(dx) == Math.abs(dy) && Math.random() < 0.5)) {
					if(dx > 0) {
						e.facing = 'left'
					}
					else {
						e.facing = 'right'
					}
				}
				else {
					if(dy > 0) {
						e.facing = 'up'
					}
					else {
						e.facing = 'down'
					}
				}
				if(old_facing != e.facing) {
					e.change_direction_cooldown_time = now+0.5
				}
				enemies_near_player = true
			}
		}

		if(e.attacking && e.type == 'player') {
			if(!e.attack_projectile_spawned && now - e.animation_start_time > 0.1) {
				if(e.facing == 'up') {
					spawn_projectile(now, e.x+1, e.y-2, e.facing, e);
				}
				else if(e.facing == 'right') {
					spawn_projectile(now, e.x+5, e.y+5, e.facing, e);
				}
				else if(e.facing == 'left') {
					spawn_projectile(now, e.x+1, e.y+5, e.facing, e);
				}
				else {
					spawn_projectile(now, e.x+3, e.y+5, e.facing, e);
				}
				e.attack_projectile_spawned = true
			}
			if(e.animation_start_time+0.25 <= now) {
				e.attacking = false
			}
		}
	}

	if(enemies_near_player && !enemies_in_attack_range && Math.random() < 0.002) {
		play_laugh_sound()
	}

	play_bgm((2000 - smallest_enemy_distance)/2000)
}

function move_projectiles(now, delta_time) {
	for(var i = 0; i < all_projectiles.length; i++) {
		var e = all_projectiles[i]
		if(e.expiration_time <= now || 
			e.y+e.h >= WORLD_SIZE-MAZE_PATH_WIDTH || e.x+e.w >= WORLD_SIZE || e.x < MAZE_PATH_WIDTH || e.y < MAZE_PATH_WIDTH) {
			all_projectiles.splice(i, 1)
			continue
		}
		do_entity_or_projectile_movement(e, delta_time)

		// Collisions with maze

		var mx = Math.floor(e.x/MAZE_PATH_WIDTH)
		var mx2 = Math.floor((e.x+e.w-1)/MAZE_PATH_WIDTH)
		var my = Math.floor((e.y+2)/MAZE_PATH_WIDTH)
		var my2 = Math.floor((e.y+e.h-1)/MAZE_PATH_WIDTH)
		if(!maze_grid[mx][my] || !maze_grid[mx2][my] || !maze_grid[mx][my2] || !maze_grid[mx2][my2]) {
			all_projectiles.splice(i, 1)
			continue
		}

		// collisions with entities

		for(var j = 0; j < all_entities.length; j++) {
			var e2 = all_entities[j]
			if(e2 != e.source_entity && !e2.dead) {
				var p = [e2.x, e2.y]
				if(e.x < p[0]+e2.w && e.x+e.w >= p[0]) {
					if(e.y < p[1]+e2.h && e.y+e.h >= p[1]) {
						e2.health -= 0.5
						if(e2.health <= 0) {
							if(e2.type == 'enemy') {
								play_enemy_death_sound()
							}
							kill_entity(e2, now)
						}
						else {
							if(e2.type == 'enemy') {
								play_enemy_hurt_sound()
							}
						}
						all_projectiles.splice(i, 1)
					}
				}
			}
		}
	}
}

function kill_entity(e, now) {
	if(!e.dead) {
		e.moving = false
		e.health = 0
		e.animation_start_time = now
		e.dead = true
	}
}

function spawn_projectile(now, x,y, dir, source_entity) {
	var e = {
		type: 'projectile',
		x: x,
		y: y,
		w: 3,
		h: 3,
		moving: true,
		speed: 50.0, // pixels per second
		texture: energy,
		facing: dir,
		expiration_time: now+5,
		source_entity: source_entity
	}
	all_projectiles.push(e)
	play_whoosh_sound()
}

function player_do_attack(now) {
	if(player_entity.dead) return

	player_entity.attack_projectile_spawned = false
	player_entity.attacking = true
	player_entity.animation_start_time = now
}

function draw_projectile_part(e, tx, ty, tw, th) {
	drawSubImage(e.texture, tx, ty, tw, th, e.x+tx, e.y+ty, tw, th)
}

function draw_projectiles() {
	for(var i = 0; i < all_projectiles.length; i++) {
		var e = all_projectiles[i]
		drawImage(e.texture, e.x, e.y)
	}
}

function redraw_entity_over_hedge_shadow(now, e) {
	var mx = Math.floor(e.x/MAZE_PATH_WIDTH)
	var mx2 = Math.floor((e.x+e.w-1)/MAZE_PATH_WIDTH)
	var my = Math.floor(e.y/MAZE_PATH_WIDTH)

	var h = MAZE_PATH_WIDTH - (Math.floor(e.y) % MAZE_PATH_WIDTH)

	if(mx == mx2 && !maze_grid[mx][my] || (mx != mx2 && !maze_grid[mx][my] && !maze_grid[mx2][my])) {
		// Top of sprite needs to be drawn over a hedge
		draw_entity_part(now, e, 0, 0, e.w, h)
	}
	else if(mx != mx2 && !maze_grid[mx][my] && maze_grid[mx2][my]) {
		// Top left of sprite needs to be drawn over a hedge
		draw_entity_part(now, e, 0, 0, MAZE_PATH_WIDTH - (Math.floor(e.x) % MAZE_PATH_WIDTH),h)
	}
	else if(mx != mx2 && !maze_grid[mx2][my] && maze_grid[mx][my]) {
		// Top right of sprite needs to be drawn over a hedge
		var w = (Math.floor(e.x+e.w) % MAZE_PATH_WIDTH)
		draw_entity_part(now, e, e.w-w, 0, w,h)
	}
}

function spawn_random_enemy() {
	var mx = 1 + Math.floor(Math.random() * (MAZE_GRID_SIZE-2))
	var my = 1 + Math.floor(Math.random() * (MAZE_GRID_SIZE-2))


	if(!maze_grid[mx][my]) {
		return
	}

	var x = mx*MAZE_PATH_WIDTH + 1 + Math.floor(Math.random()*3)
	var y = my*MAZE_PATH_WIDTH + 1 + Math.floor(Math.random()*2)

	if(Math.abs(player_entity.x - x) < 70 || Math.abs(player_entity.x - x) < 70) {
		return;
	}

	var e = add_enemy_a(x, y);
	e.moving = true
	e.facing = pick_random_direction()
}