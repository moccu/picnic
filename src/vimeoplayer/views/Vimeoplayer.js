/**
 * Vimeo Player API reference
 * https://github.com/vimeo/player.js
 */

import $ from 'jquery';
import _ from 'underscore';
import Mediaplayer from 'picnic/mediaplayer/views/Mediaplayer';
import ApiLoader from 'picnic/vimeoplayer/services/ApiLoader';

var DATA_VIDEOID = 'vimeo-id',
	DEFAULTS = {
		loader: new ApiLoader(),
		classLoading: 'loading',
		classPlaying: 'playing',
		playerHideSpeed: 300,
		playerOptions: {
			autoplay: true
		},
		playerProgressSteps: 5,  // in percent (%)
		playerProgressInterval: 1000
	};

class Player extends Mediaplayer {

	constructor(options) {
		super($.extend({}, DEFAULTS, options));
		this._resetProgress();
	}

	render() {
		super.render();
		this._bindEvents();
		return this;
	}

	//================================================================================
	// Public Methods
	//================================================================================

	/**
	 * Play the video if is initialized otherwise render it
	 */
	play() {
		if (this._hasPlayer()) {
			this._player.play();
			this._onPlayHandler();
		} else {
			this._renderPlayer();
		}
	}

	/**
	 * Pause the video
	 */
	pause() {
		if (this._hasPlayer()) {
			this._player.pause();
		}
	}

	/**
	 * Stop the video
	 */
	stop() {
		this.stopMedia();
	}

	/**
	 * Overwrite default stopMedia method
	 */
	stopMedia() {
		if (this._hasPlayer()) {
			this._player.unload();
			this._onStopHandler();
		}
	}

	/**
     * Get the id of the video
     *
     * @return {number}
     */
	getVideoId() {
		return this.$el.data(DATA_VIDEOID);
	}

	/**
	 * Get the progress of the video
	 *
	 * @return {number}
	 */
	getProgress() {
		return this._progress;
	}

	/**
     * Show player iFrame
     */
	showDisplay() {
		if (this.$player) {
			this.$player.show();
			this.$el.addClass(this.options.classPlaying);
		}
	}

	/**
     * Hide player iFrame
     */
	hideDisplay() {
		if (this.$player) {
			this.$player.fadeOut(this.options.playerHideSpeed);
			this.$el.removeClass(this.options.classPlaying);
		}
	}

	//================================================================================
	// Private Methods
	//================================================================================

	/**
     * Return true or false if the player is allready initialized
     *
     * @return {boolean}
     */
	_hasPlayer() {
		return !!this._player;
	}

	/**
     * Render player
     */
	_renderPlayer() {
		var self = this,
			options = $.extend({}, self.options.playerOptions),
			container = self.$el;

		// Add loading class
		self.$el.addClass(self.options.classLoading);

		// Use ApiLoader service
		self.options.loader.requestPlayer().done(function(Player) {

			// Initialize player
			self._player = new Player(container[0], options);

			// Listen Vimeo Player API Events/Methods
			self._player.ready().then(self._onReady);
			self._player.on('play', self._onPlay);
			self._player.on('pause', self._onPause);
			self._player.on('ended', self._onEnded);
			self._player.on('loaded', self._onLoaded);
			self._player.on('error', self._onError);
		});
	}

	/**
	 * Update interval
	 */
	_updateInterval() {
		if (!this._interval) {
			this._interval = window.setInterval(
				this._onInterval,
				this.options.playerProgressInterval
			);
		}
	}

	/**
	 * Reset interval
	 */
	_resetInterval() {
		if (this._interval) {
			window.clearInterval(this._interval);
			this._interval = undefined;
			delete(this._interval);
		}
	}

	/**
	 * Update video progress
	 */
	_updateProgress() {
		if (this._hasPlayer()) {
			var self = this,
				steps = self.options.playerProgressSteps;

			self._player.getCurrentTime().then(function(seconds) {
				self._player.getDuration().then(function(duration) {
					var progress = seconds / duration * 100;

					progress = Math.floor(progress / steps) * steps;
					progress = Math.max(self._progress, progress);

					if (progress !== self._progress) {
						self._progress = progress;
						self.context.dispatch('vimeoplayer:updateprogress', self);
					}
				});
			});
		}
	}

	/**
	 * Reset video progress
	 */
	_resetProgress() {
		this._progress = -1;
	}

	//================================================================================
	// Events
	//================================================================================

	/**
     * Bind events
     */
	_bindEvents() {
		_.bindAll(
			this,
			'_onClickPlay',
			'_onInterval',
			'_onPlay',
			'_onPause',
			'_onEnded',
			'_onLoaded',
			'_onError',
			'_onReady'
		);

		this.$el.on('click', 'a', this._onClickPlay);
	}

	/**
     * Click event
     *
     * @param {object} e
     */
	_onClickPlay(e) {
		e.preventDefault();
		this.play();
	}

	/**
	 * Interval event handler
	 */
	_onInterval() {
		this._updateProgress();
	}

	/**
	 * Play event handler
	 */
	_onPlayHandler() {
		this._updateProgress();
		this._updateInterval();
		this.playMedia();
		this.showDisplay();
		this.context.dispatch('vimeoplayer:play', this);
	}

	/**
	 * Stop event handler
	 *
	 * @param {string} [eventName]
	 */
	_onStopHandler(eventName) {
		this._resetProgress();
		this._resetInterval();
		this.hideDisplay();
		this.context.dispatch(eventName || 'vimeoplayer:stop', this);
	}

	/**
     * Vimeo Player API Event:
     * Triggered when the video plays
     *
     * @see https://github.com/vimeo/player.js#play
     */
	_onPlay() {
		this._onPlayHandler();
	}

	/**
     * Vimeo Player API Event:
     * Triggered when the video pauses
     *
     * @see https://github.com/vimeo/player.js#pause
     */
	_onPause() {}

	/**
     * Vimeo Player API Event:
     * Triggered any time the video playback reaches the end
     *
     * @see https://github.com/vimeo/player.js#ended
     */
	_onEnded() {
		this._onStopHandler('vimeoplayer:complete');
	}

	/**
     * Vimeo Player API Event:
     * Triggered when a new video is loaded in the player
     *
     * @see https://github.com/vimeo/player.js#loaded
     */
	_onLoaded() {}

	/**
     * Vimeo Player API Event:
     * Triggered when some kind of error is generated in the player
     *
     * @see https://github.com/vimeo/player.js#error
     */
	_onError() {}

	/**
     * Vimeo Player API Method:
     * Trigger a function when the player iframe has initialized
     *
     * @see https://github.com/vimeo/player.js#ready-promisevoid-error
     */
	_onReady() {
		// Store player iFrame
		this.$player = $(this._player.element);

		// Remove loading class
		this.$el.removeClass(this.options.classLoading);

		// Play
		this._onPlayHandler();
	}

}

export default Player;
