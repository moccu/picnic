import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';

var
	EVENT_PLAY = 'mediaplayer:play'
;

class View extends BaseView {

	constructor(options) {
		super(options);

		this.context.vent.on(
			EVENT_PLAY,
			_.bind(this._onMediaPlay, this)
		);
	}

	render() {
		return this;
	}

	playMedia() {
		// Call this method when specific media is started to play.
		this.context.vent.trigger(EVENT_PLAY, {
			instance: this
		});
	}

	stopMedia() {
		// Overwrite this method and implement behaviour to stop specific .
		throw new Error('Overwrite this method in specific media player.');
	}

	_onMediaPlay(event) {
		if (event.instance && event.instance !== this) {
			this.stopMedia();
		}
	}
}

export default View;
