import $ from 'jquery';
import _ from 'underscore';
import Mediaplayer from 'picnic/mediaplayer/views/Mediaplayer';
import ApiLoader from 'picnic/youtubeplayer/services/ApiLoader';
import Template from 'picnic/youtubeplayer/views/Youtubeplayer.html!text';


var
	template = _.template(Template),

	DATA_VIDEOID = 'youtubeid',
	DEFAULTS = {
		loader: new ApiLoader(),
		selectorPlay: 'a',
		progressInterval: 1000, // in ms
		progressSteps: 5, // in percent (%)
		fadeOutDuration: 300, // in ms
		classLoading: 'loading',
		classPlaying: 'playing',

		settings: {
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
		}
	}
;


/**
 * A module including a view to generate a Youtubeplayer.
 *
 * The view requires for each element a video id passed by the data attribute
 * `data-youtubeid` and an link that triggers the play event on click, as you
 * can see in the example below.
 *
 * Once the user clicks the link, the youtube iframe api is loaded and the
 * player will be initialized. Multiple youtubeplayer on a single page share the
 * same api. The api will be loaded only once when the first player starts to
 * play.
 *
 * @class Youtubeplayer
 * @see {@link https://developers.google.com/youtube/iframe_api_reference|Youtube Player iFrame API Reference}
 * @example
 * 		<div class="youtubeplayer" data-youtubeid="{{id}}">
 * 			<a href="https://www.youtube.com/watch?v={{id}}" target="_blank" title="Play video">
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
	 * @param {object} options.loader ApiLoader reference
	 * @param {string} options.selectorPlay Selector of the element that
	 *		triggers the inizialize or play event. The default value is "a"
	 * @param {string} options.classLoading Set a CSS class on loading the video.
	 *		The default value is "loading"
	 * @param {string} options.classPlaying Set a CSS class on playing the video.
	 *		The default value is "playing"
	 * @param {number} options.fadeOutDuration Set the speed of the hide animation,
	 *		in miliseconds. The default value is 300
	 * @param {number} options.progressSteps Update progress every x steps,
	 *		in percent. The default value is 5
	 * @param {number} options.progressInterval Set the progress interval,
	 *		in milliseconds. The default value is 1000
	 * @param {object} options.settings Youtubeplayer settings
	 * @param {object} options.settings.width Youtubeplayer width is by default
	 *		set to "100%".
	 * @param {object} options.settings.height Youtubeplayer height is by
	 * 		default set to "100%".
	 * @param {object} options.settings.playerVars Youtubeplayer parameters
	 *		including overwritten default values according the documentation
	 *		https://developers.google.com/youtube/player_parameters#Parameters.
	 * @param {number} options.settings.playerVars.autoplay Sets whether or not
	 * 		the initial video will autoplay when the player loads. Default is 1
	 * @param {string} options.settings.playerVars.color This parameter
	 * 		specifies the color that will be used in the player's video progress
	 * 		bar to highlight the amount of the video that the viewer has already
	 * 		seen. Valid parameter values are red and white, and, by default, the
	 * 		player will use the color red in the video progress bar. Default
	 * 		value is "white"
	 * @param {number} options.settings.playerVars.showinfo The parameter's
	 * 		default value is 1. If you set the parameter value to 0, then the
	 * 		player will not display information like the video title and
	 * 		uploader before the video starts playing. Default value is 0
	 * @param {number} options.settings.playerVars.rel This parameter indicates
	 * 		whether the player should show related videos when playback of the
	 * 		initial video ends. Default value is 0
	 * @param {string} options.settings.playerVars.theme This parameter
	 * 		indicates whether the embedded player will display player controls
	 * 		(like a play button or volume control) within a dark or light
	 * 		control bar. Valid parameter values are dark and light, and, by
	 * 		default, the player will display player controls using the dark
	 * 		theme. Default value is "light"
	 * @param {string} options.settings.playerVars.wmode Sets the flash wmode.
	 * 		Default value is "opaque"
	 */
	constructor(options) {
		super($.extend(true, {}, DEFAULTS, options));
		this._progressReset();

		_.bindAll(
			this,
			'_onClickPlay',
			'_onInterval',
			'_onPlayerReceived',
			'_onPlayerRendered',
			'_onPlayerStateChange',
			'_onPlayerError'
		);
	}

	/**
	 * This renders the content of this view
	 *
	 * @return {object} The instance of this view
	 */
	render() {
		super.render();

		this.$el.find(this.options.selectorPlay)
			.on('click', this._onClickPlay);

		return this;
	}

	/**
	 * Remove event listeners and destroy inner youtubeplayer instance.
	 */
	destroy() {
		if (!this.options) {
			return;
		}

		this.$el.find(this.options.selectorPlay)
			.off('click', this._onClickPlay);

		if (this._hasPlayer()) {
			this._player.destroy();
		}

		this._intervalPause();

		super.destroy();
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
	 * Play the video if is initialized otherwise render the player.
	 */
	play() {
		if (this._hasPlayer()) {
			// The playVideo function may be sometimes not defined at the
			// player instance. If it fails, we try to show the iframe of the
			// player instead...
			try {
				this._player.playVideo();
			} catch(error) {
				this._showDisplay();
			}
		} else {
			this._renderPlayer();
		}
	}

	/**
	 * Pause the video
	 */
	pause() {
		if (this._hasPlayer()) {
			// The pauseVideo function may be sometimes not defined at the
			// player instance. So we only can try to pause the video...
			try {
				this._player.pauseVideo();
			} catch(error) {}
		}
	}

	/**
	 * Stop the video
	 */
	stop() {
		this.stopMedia();
	}

	/**
	 * Overwrite default stopMedia method from [Mediaplayer](#mediaplayer).
	 */
	stopMedia() {
		if (this._hasPlayer()) {
			// The stopVideo function may be sometimes not defined at the
			// player instance. So we only can try to stop the video...
			try {
				this._player.stopVideo();
				this._onStop();
			} catch(error) {}
		}
	}

	// Controls:
	// -------------------------------------------------------------------------

	_showDisplay() {
		if (this.$player) {
			this.$player.show();
			this.$el.addClass(this.options.classPlaying);
		}
	}

	_hideDisplay() {
		if (this.$player) {
			this.$player.fadeOut(this.options.fadeOutDuration);
			this.$el.removeClass(this.options.classPlaying);
		}
	}

	_hasPlayer() {
		return !!this._player;
	}

	_renderPlayer() {
		if (!this._player) {
			this.$el
				.addClass(this.options.classLoading);

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
				this.options.progressInterval
			);
		}
	}

	_progressUpdate() {
		if (this._hasPlayer()) {
			var
				player = this._player,
				progress = player.getCurrentTime() / player.getDuration() * 100
			;

			progress = Math.floor(progress / this.options.progressSteps) * this.options.progressSteps;
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
	// -------------------------------------------------------------------------
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
	// -------------------------------------------------------------------------
	_onPlay() {
		// Call play media to inform about current play state.
		this.playMedia();

		this._progressUpdate();
		this._intervalContinue();
		this._showDisplay();

		this.context.dispatch('youtubeplayer:play', this);
	}

	_onStop(customEventName) {
		this._intervalPause();
		this._progressReset();
		this._hideDisplay();

		this.context.dispatch(customEventName || 'youtubeplayer:stop', this);
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
			}, this.options.settings)
		;

		// filter container 'div' for test cases
		// (livereload adds script block)
		container = $(template()).filter('div').appendTo(this.$el);

		// Create player instance
		this._player = new PlayerClass(container.get(0), options);
	}

	_onPlayerRendered() {
		this.$player = $(this._player.getIframe());
		this.$el.removeClass(this.options.classLoading);
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
