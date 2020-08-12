'use strict';

var gravel_sound_state = 'NOT PLAYING'
var gravel_sound_fade_out_start_time = -1


function play_gravel_footsteps() {
	if(gravel_sound_state == 'NOT PLAYING' || gravel_sound_state == 'FADING OUT') {
		gravel_sound_state = 'PLAYING'
		sound_gravel.currentTime = 0
		sound_gravel.volume = 0.3
		sound_gravel.play();
	}
}

function stop_gravel_footsteps() {
	if(gravel_sound_state == 'PLAYING') {
		gravel_sound_state = 'FADING OUT'
		gravel_sound_fade_out_start_time = -1
	}
}

var bgm_enabled = true

var bgm_vol = 0
var bgm_playing = false

// Volume between 0 and 1
function play_bgm(volume) {
	if(!bgm_enabled) {
		stop_bgm()
		return
	}

	if(volume < 0.01) {
		volume = 0
	}

	volume = Math.sin(volume)

	if(Math.abs(volume - bgm_vol) > 0.005) {
		bgm_vol += Math.sign(volume - bgm_vol) * 0.005
	}
	else {
		bgm_vol = volume
	}
	bgm_vol = clamp(bgm_vol, 0, 1)

	if(bgm_vol < 0.01) {
		stop_bgm()
		return
	}

	sound_bgm.volume = bgm_vol * 0.2
	if(!bgm_playing && user_has_interacted) {
		bgm_playing = true
		sound_bgm.currentTime = 0
		sound_bgm.play();
	}
}

function stop_bgm() {
	bgm_playing = false
	sound_bgm.pause()
}

function update_sound(now) {
	if(gravel_sound_state == 'FADING OUT') {
		if(gravel_sound_fade_out_start_time < 0) {
			gravel_sound_fade_out_start_time = now
		}
		if(now - gravel_sound_fade_out_start_time >= 0.333) {
			sound_gravel.pause()
			gravel_sound_state = 'NOT PLAYING'
		}
		else {
			sound_gravel.volume = clamp(0.3 - (now - gravel_sound_fade_out_start_time)*0.3*3.0, 0, 0.3)
		}
	}
}

var hurt_sounds = [sound_hurt, sound_hurt2, sound_hurt3, sound_hurt4]
var hurt_sounds_i = Math.floor(Math.random() * 3.95)

function play_hurt_sound() {
	var s = hurt_sounds[hurt_sounds_i]
	hurt_sounds_i = (hurt_sounds_i+1) % hurt_sounds.length
	s.volume = 0.5
	s.play()
}

function play_laugh_sound() {
	sound_laugh.volume = 0.1
	sound_laugh.play()
}

function play_key_sound() {
	sound_key.volume = 0.3
	sound_key.play()
}

var enemy_hurt_sounds = [sound_enemy_hurt, sound_enemy_hurt2]
var enemy_hurt_sounds_i = 0

function play_enemy_hurt_sound() {
	var s = enemy_hurt_sounds[enemy_hurt_sounds_i]
	enemy_hurt_sounds_i = (enemy_hurt_sounds_i+1) % enemy_hurt_sounds.length
	s.volume = 0.05
	s.play()
}

function play_enemy_death_sound() {
	sound_enemy_hurt.volume = 0.1
	sound_enemy_hurt.play()
}

function play_whoosh_sound() {
	sound_whoosh.volume = 0.05
	sound_whoosh.play()
}

var death_music_playing = false

function play_death_music() {
	if(!death_music_playing) {
		sound_dead_music.volume = 0.3
		sound_dead_music.play()
		death_music_playing = true
	}
}

var win_music_playing = false

function play_win_music() {
	if(!win_music_playing) {
		sound_win_music.volume = 0.3
		sound_win_music.play()
		win_music_playing = true
	}
}

function stop_all_sounds() {
	hurt_sounds.forEach(function(s){s.pause()})
	sound_gravel.pause()
	sound_laugh.pause()
	sound_key.pause()
	sound_enemy_hurt.pause()
	sound_enemy_hurt2.pause()
	sound_whoosh.pause()
	sound_bgm.pause()
	sound_dead_music.pause()
	sound_dead_music.currentTime = 0
	sound_win_music.pause()
	sound_win_music.currentTime = 0

	death_music_playing = false
	win_music_playing = false
	gravel_sound_state = 'NOT PLAYING'
	bgm_playing = false
}
