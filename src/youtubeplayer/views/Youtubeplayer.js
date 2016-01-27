/* The Youtube Player iFrame API Reference:
 * https://developers.google.com/youtube/iframe_api_reference */

import $ from 'jquery';
import _ from 'underscore';
import Mediaplayer from 'picnic/mediaplayer/views/Mediaplayer';
import ApiLoader from 'picnic/youtubeplayer/services/ApiLoader';
import Template from 'picnic/youtubeplayer/views/Youtubeplayer.html!text';

var
	template = _.template(Template),

	DATA_VIDEOID = 'youtubeid',
	DEFAULTS = {
		loader: new ApiLoader()
	},
	PLAYER_SETTINGS = {
		width: '100%',
		height: '100%',
		playerVars: {
			autoplay: 1,	// Values: 0 or 1. Default is 0. Sets whether or not the initial video will autoplay when the player loads.
			color: 'white', // This parameter specifies the color that will be used in the player's video progress bar to highlight the amount of the video that the viewer has already seen. Valid parameter values are red and white, and, by default, the player will use the color red in the video progress bar.
			showinfo: 0,	// Values: 0 or 1. The parameter's default value is 1. If you set the parameter value to 0, then the player will not display information like the video title and uploader before the video starts playing.
			rel: 0,			// Values: 0 or 1. Default is 1. This parameter indicates whether the player should show related videos when playback of the initial video ends.
			theme: 'light',	// This parameter indicates whether the embedded player will display player controls (like a play button or volume control) within a dark or light control bar. Valid parameter values are dark and light, and, by default, the player will display player controls using the dark theme.
			wmode: 'opaque'	// Sets the flash wmode
		}
	},
	PLAYER_PROGRESS_INTERVAL = 1000,
	PLAYER_PROGRESS_STEPS = 5, // in percent (%)
	PLAYER_FADEOUT = 300,
	CLASS_LOADING = 'loading',
	CLASS_PLAYING = 'playing'
;

class View extends Mediaplayer {

	// Public API:
	// ---------------------------------------------------------------------

	constructor(options) {
		super($.extend({}, DEFAULTS, options));
		this._progressReset();
	}

	render() {
		super.render();
		this._bindEvents();
		return this;
	}

	getVideoId() {
		return this.$el.data(DATA_VIDEOID);
	}

	getProgress() {
		return this._progress;
	}

	play() {
		if (this._hasPlayer()) {
			// The playVideo function may be sometimes not defined at the
			// player instance. If it fails, we try to show the iframe of the
			// player instead...
			try {
				this._player.playVideo();
			} catch(error) {
				this.showDisplay();
			}
		} else {
			this._renderPlayer();
		}
	}

	pause() {
		if (this._hasPlayer()) {
			this._player.pauseVideo();
		}
	}

	stop() {
		this.stopMedia();
	}

	stopMedia() {
		if (this._hasPlayer()) {
			this._player.stopVideo();
			this._onStop();
		}
	}

	showDisplay() {
		if (this.$player) {
			this.$player.show();
			this.$el.addClass(CLASS_PLAYING);
		}
	}

	hideDisplay() {
		if (this.$player) {
			this.$player.fadeOut(PLAYER_FADEOUT);
			this.$el.removeClass(CLASS_PLAYING);
		}
	}

	// Controls:
	// ---------------------------------------------------------------------

	_hasPlayer() {
		return !!this._player;
	}

	_bindEvents() {
		_.bindAll(
			this,
			'_onClickPlay',
			'_onInterval',
			'_onPlayerReceived',
			'_onPlayerRendered',
			'_onPlayerStateChange',
			'_onPlayerError'
		);

		this.$el.find('a').on('click', this._onClickPlay);
	}

	_renderPlayer() {
		if (!this._player) {
			this.$el
				.addClass(CLASS_LOADING);

			this.options.loader
				.requestPlayer()
				.done(this._onPlayerReceived);
		}
	}

	_intervalPause() {
		if (this._interval) {
			window.clearInterval(this._interval);
			this._interval = undefined;
			delete(this._interval);
		}
	}

	_intervalContinue() {
		if (!this._interval) {
			this._interval = window.setInterval(
				this._onInterval,
				PLAYER_PROGRESS_INTERVAL
			);
		}
	}

	_progressUpdate() {
		if (this._hasPlayer()) {
			var
				player = this._player,
				progress = player.getCurrentTime() / player.getDuration() * 100
			;

			progress = Math.floor(progress / PLAYER_PROGRESS_STEPS) * PLAYER_PROGRESS_STEPS;
			progress = Math.max(this._progress, progress);

			if (progress !== this._progress) {
				this._progress = progress;
				this.context.dispatch('youtubeplayer:updateprogress', this);
			}
		}
	}

	_progressReset() {
		this._progress = -1;
	}

	// Events: User interaction
	// ---------------------------------------------------------------------
	_onClickPlay(event) {
		event.preventDefault();
		if (this._hasPlayer()) {
			try {
				// The seekTo function may be sometimes not defined at the
				// player instance. So we only can try to jump to the
				// first frame...
				this._player.seekTo(0);
			} catch(error) {}
		}

		this.play();
	}

	// Events: Youtube Player
	// ---------------------------------------------------------------------
	_onPlay() {
		var self = this;
		// Call play media to inform about current play state.
		self.playMedia();

		self._progressUpdate();
		self._intervalContinue();
		self.showDisplay();

		self.context.dispatch('youtubeplayer:play', self);
	}

	_onStop(customEventName) {
		var self = this;
		self._intervalPause();
		self._progressReset();
		self.hideDisplay();

		self.context.dispatch(customEventName || 'youtubeplayer:stop', self);
	}

	_onInterval() {
		this._progressUpdate();
	}

	_onPlayerReceived(PlayerClass) {
		var
			container,
			options = $.extend({
				videoId: this.getVideoId(),
				events: {
					onReady: this._onPlayerRendered,
					onStateChange: this._onPlayerStateChange,
					onError: this._onPlayerError
				}
			}, PLAYER_SETTINGS)
		;

		// filter container 'div' for test cases
		// (livereload adds script block)
		container = $(template()).filter('div').appendTo(this.$el);

		// Create player instance
		this._player = new PlayerClass(container.get(0), options);
	}

	_onPlayerRendered() {
		this.$player = $(this._player.getIframe());
		this.$el.removeClass(CLASS_LOADING);
	}

	_onPlayerStateChange(event) {
		switch (event.data) {
			case window.YT.PlayerState.ENDED:
				this._onStop('youtubeplayer:complete');
				break;
			case window.YT.PlayerState.PLAYING:
				this._onPlay();
				break;
			default:
				this._intervalPause();
				break;
		}
	}

	_onPlayerError() {
		// Handle error events...
	}

}

export default View;
