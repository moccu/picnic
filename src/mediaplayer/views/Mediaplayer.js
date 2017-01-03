import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';

var
	EVENT_PLAY = 'mediaplayer:play'
;


/**
 * This class is intended to be a generic, base class for all mediaplayers
 * views. It ships the possebility to stop an active player instance of any type
 * (inherit by this class), when an other player instance starts to play. This
 * prevents the mix of sounds from (for example) two videos.
 *
 * An instance of this class got two methods. `.playMedia()` and `.stopMedia()`.
 * The first should be called in a specific implementation when it starts to
 * play. This will inform all other instances on the website to stop, if they
 * are running. To stop, each instance will call it's own `.stopMedia()` method.
 * The specific implementation needs to overwrite this method and stop the
 * specific player.
 *
 * The Views [Youtubeplayer](#youtubeplayer) and [Vimeoplayer](#vimeoplayer)
 * are specific implmentations of this mediaplayer class.
 *
 * @class Mediaplayer
 * @example
 * 		import Mediaplayer from 'picnic/Mediaplayer';
 *
 * 		class HTML5Videoplayer extends Mediaplayer {
 *
 *			get events() {
 *				return {
 *					'click': 'play'
 *				};
 *			}
 *
 * 			play() {
 * 				this.el.play();
 * 				this.playMedia();
 * 			}
 *
 * 			stop() {
 * 				this.el.stop();
 * 			}
 *
 *			stopMedia() {
 * 				this.stop();
 *			}
 *
 * 		}
 *
 *		var player = new HTML5Videoplayer({
 *			el: $('video')[0],
 *			context: app.context
 *		}).render();
 */
class View extends BaseView {

	/**
	 * Creates an instance of the view.
	 *
	 * @constructor
	 * @param {object} options The settings for the view
	 * @param {object} options.context The reference to the backbone.geppetto context
	 * @param {object} options.el The element reference for a backbone.view
	 */
	constructor(options) {
		super(options);

		this.context.vent.on(
			EVENT_PLAY,
			_.bind(this._onMediaPlay, this)
		);
	}

	/**
	 * Call this method when specific media is started to play.
	 */
	playMedia() {
		this.context.vent.trigger(EVENT_PLAY, {
			instance: this
		});
	}

	/**
	 * Overwrite this method and implement behaviour to stop specific player.
	 */
	stopMedia() {
		throw new Error('Overwrite this method in specific mediaplayer.');
	}

	_onMediaPlay(event) {
		if (event.instance && event.instance !== this) {
			this.stopMedia();
		}
	}
}

export default View;
