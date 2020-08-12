'use strict';

var screen_shaking = false
var screen_shake_start = 0


function apply_shake(view_pos, now) {
	if(screen_shaking) {
		var d = now - screen_shake_start
		if(d < 0.1) {
			return [view_pos[0]+1, view_pos[1]]
		}
		else if(d < 0.2) {
			return [view_pos[0]-1, view_pos[1]]
		}
		else {
			screen_shaking = false
			return [view_pos[0], view_pos[1]]
		}
	}
	else {
		return [view_pos[0], view_pos[1]]
	}
}

function start_shake(now) {
	if(!screen_shaking) {
		screen_shaking = true
		screen_shake_start = now
	}
}