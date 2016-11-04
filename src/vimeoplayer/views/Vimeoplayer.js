import $ from 'jquery';
import _ from 'underscore';
import Mediaplayer from 'picnic/mediaplayer/views/Mediaplayer';
import ApiLoader from 'picnic/vimeoplayer/services/ApiLoader';

var DATA_VIDEOID = 'vimeoid',
	DEFAULTS = {
		debug: false,
		loader: new ApiLoader(),
		trigger: 'a',
		classLoading: 'loading',
		classPlaying: 'playing',
		playerHideSpeed: 300,
		playerProgressSteps: 5,
		playerProgressInterval: 1000,
		playerOptions: {
			autoplay: true
		},
	};

/**
 * Vimeo Player API
 *
 * @class Vimeoplayer
 * @see https://github.com/vimeo/player.js
 * @example
 * 		<div class="vimeoplayer" data-vimeoid="{{id}}">
 * 			<a href="https://vimeo.com/{{id}}" target="_blank" title="Play video">
 * 				Play video
 * 			</a>
 * 		</div>
 */
class View extends Mediaplayer {

	/**
	 * Creates an instance of the view.
	 *
	 * @constructor
	 * @param {object} options The settings for the view
	 * @param {object} options.context The reference to the backbone.geppetto context
	 * @param {object} options.el The element reference for a backbone.view
	 * @param {boolean} options.debug Enable debug mode. The default value is false
	 * @param {object} options.loader ApiLoader reference
	 * @param {string} options.trigger Name of the element that triggers the
	 *		inizialize or play event. The default value is "a"
	 * @param {string} options.classLoading Set a CSS class on loading the video.
	 *		The default value is "loading"
	 * @param {string} options.classPlaying Set a CSS class on playing the video.
	 *		The default value is "playing"
	 * @param {number} options.playerHideSpeed Set the speed of the hide animation,
	 *		in miliseconds. The default value is 300
	 * @param {number} options.playerProgressSteps Update progress every x steps,
	 *		in percent. The default value is 5
	 * @param {number} options.playerProgressInterval Set the progress interval,
	 *		in milliseconds. The default value is 1000
	 * @param {object} options.playerOptions Vimeo Player options,
	 *		see https://github.com/vimeo/player.js#embed-options.
	 *		By default the autoplay option is set to true
	 */
	constructor(options) {
		super($.extend({}, DEFAULTS, options));
		this._resetProgress();
	}

	//================================================================================
	// Public Methods
	//================================================================================

	/**
	 * This renders the content of this view
	 * @return {object} The instance of this view
	 */
	render() {
		super.render();
		this._bindEvents();
		return this;
	}

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
			this._onPauseHandler();
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
     * @return {number} The id of the video
     */
	getVideoId() {
		return this.$el.data(DATA_VIDEOID);
	}

	/**
	 * Get the progress of the video
	 *
	 * @return {number} The progress of the video
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
	 * Debug mode
	 *
	 * @private
	 */
	_debug() {
		if (this.options.debug) {
			// Be aware that console is present
			var console = window.console || {};
			console.log = console.log || function() {};

			// Initialize debug counter
			if (!this._debugCount) {
				this._debugCount = 0;
			}

			// Log
			console.log.apply(
				console,
				[this.getVideoId(), this._debugCount++].concat(
					Array.prototype.slice.call(arguments)
				)
			);
		}
	}

	/**
     * Return true or false if the player is already initialized
     *
     * @private
     * @return {boolean}
     */
	_hasPlayer() {
		return !!this._player;
	}

	/**
     * Render player
     *
     * @private
     */
	_renderPlayer() {
		if (!this._player) {
			// Add loading class
			this.$el.addClass(this.options.classLoading);

			// Use ApiLoader service
			this.options.loader.requestPlayer().done(this._onPlayerReceived);
		}
	}

	/**
	 * Update interval
	 *
	 * @private
	 */
	_updateInterval() {
		if (!this._interval) {
			this._interval = window.setInterval(
				this._onInterval,
				this.options.playerProgressInterval
			);
			this._debug('updateInterval');
		}
	}

	/**
	 * Reset interval
	 *
	 * @private
	 */
	_resetInterval() {
		if (this._interval) {
			window.clearInterval(this._interval);
			this._interval = undefined;
			delete(this._interval);
			this._debug('resetInterval');
		}
	}

	/**
	 * Update video progress
	 *
	 * @private
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
						self._debug('updateProgress', self._progress);
					}
				});
			});
		}
	}

	/**
	 * Reset video progress
	 *
	 * @private
	 */
	_resetProgress() {
		this._progress = -1;
		this._debug('resetProgress', this._progress);
	}

	//================================================================================
	// Events
	//================================================================================

	/**
     * Bind events
     *
     * @private
     */
	_bindEvents() {
		_.bindAll(
			this,
			'_onClickPlay',
			'_onPlayerReceived',
			'_onInterval',
			'_onPlay',
			'_onPause',
			'_onEnded',
			'_onLoaded',
			'_onError',
			'_onReady'
		);

		this.$el.on('click', this.options.trigger, this._onClickPlay);
	}

	/**
	 * Play event handler
	 *
	 * @private
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
	 * @private
	 * @param {string} [eventName] The event name to dispatch onto the Context's Event Bus
	 */
	_onStopHandler(eventName) {
		this._resetProgress();
		this._resetInterval();
		this.hideDisplay();
		this.context.dispatch(eventName || 'vimeoplayer:stop', this);
	}

	/**
	 * Pause event handler
	 *
	 * @private
	 */
	_onPauseHandler() {
		this._resetInterval();
		this.$el.removeClass(this.options.classPlaying);
	}

	/**
     * Click event
     *
     * @private
     * @param {object} e The jQuery event object
     */
	_onClickPlay(e) {
		e.preventDefault();
		this.play();
	}

	/**
	 * Player received event handler
	 *
	 * @private
	 * @param {object} Player The player class which is sent by the ApiLoader service
	 */
	_onPlayerReceived(Player) {
		var options = $.extend({}, {id: this.getVideoId()}, this.options.playerOptions),
			container = this.$el;

		this._debug('onPlayerReceived', options);

		// Initialize player
		this._player = new Player(container[0], options);

		// Listen Vimeo Player API Events/Methods
		this._player.ready().then(this._onReady);
		this._player.on('play', this._onPlay);
		this._player.on('pause', this._onPause);
		this._player.on('ended', this._onEnded);
		this._player.on('loaded', this._onLoaded);
		this._player.on('error', this._onError);
	}

	/**
	 * Interval event handler
	 *
	 * @private
	 */
	_onInterval() {
		this._updateProgress();
	}

	/**
     * Vimeo Player API Event:
     * Triggered when the video plays
     *
     * @private
     * @param {object} data Reports back duration, percent and seconds of the video
     * @see https://github.com/vimeo/player.js#play
     */
	_onPlay(data) {
		this._debug('onPlay', data);
		this._onPlayHandler();
	}

	/**
     * Vimeo Player API Event:
     * Triggered when the video pauses
     *
     * @private
     * @param {object} data Reports back duration, percent and seconds of the video
     * @see https://github.com/vimeo/player.js#pause
     */
	_onPause(data) {
		this._debug('onPause', data);
		this._onPauseHandler();
	}

	/**
     * Vimeo Player API Event:
     * Triggered any time the video playback reaches the end
     *
     * @private
     * @param {object} data Reports back duration, percent and seconds of the video
     * @see https://github.com/vimeo/player.js#ended
     */
	_onEnded(data) {
		this._debug('onEnded', data);
		this._onStopHandler('vimeoplayer:complete');
	}

	/**
     * Vimeo Player API Event:
     * Triggered when a new video is loaded in the player
     *
     * @private
     * @param {object} data Reports back the id of the video
     * @see https://github.com/vimeo/player.js#loaded
     */
	_onLoaded(data) {
		this._debug('onLoaded', data);
	}

	/**
     * Vimeo Player API Event:
     * Triggered when some kind of error is generated in the player
     *
     * @private
     * @param {object} data Reports back the error informations
     * @see https://github.com/vimeo/player.js#error
     */
	_onError(data) {
		this._debug('onError', data);
	}

	/**
     * Vimeo Player API Method:
     * Trigger a function when the player iframe has initialized
     *
     * @private
     * @see https://github.com/vimeo/player.js#ready-promisevoid-error
     */
	_onReady() {
		this._debug('onReady');

		// Store player iFrame
		this.$player = $(this._player.element);

		// Remove loading class
		this.$el.removeClass(this.options.classLoading);

		// Play
		this._onPlayHandler();
	}

}

export default View;
