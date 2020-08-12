'use strict';

function render_hud() {
	set_hud_transform();

	// Darken edges of viewport

	drawImage(dark, 0, 0, 64, 64)

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