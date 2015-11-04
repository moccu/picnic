import $ from 'jquery';

var
	win = window,
	doc = document,
	DEFAULTS = {
		url: 'https://www.youtube.com/iframe_api'
	}
;

class ApiLoader {

	constructor(options) {
		this.options = $.extend({}, DEFAULTS, options);
	}

	requestPlayer() {
		var self = this;

		// If already requested, return deffered object...
		if (self._deferred) {
			return self._getDeffered();
		}

		// If player api was already loaded by an other instance or embedded
		// directly into the html code...
		if (self._hasPlayer()) {
			return self._resolvePlayer();
		}

		// If the api is requested but the response wasn't called...
		if (typeof win.onYouTubeIframeAPIReady === 'function') {
			// ...then nest the existing callback inside the new attached
			// callback to notifiy all attached listeners...
			win.onYouTubeIframeAPIReady = (function(callback) {
				return function() {
					self._resolvePlayer();
					callback(self._getPlayer());
				};
			})(win.onYouTubeIframeAPIReady);

			return self._getDeffered();
		}

		// Request the api...
		win.onYouTubeIframeAPIReady = $.proxy(self._resolvePlayer, self);
		return self._loadPlayer();
	}

	_getPlayer() {
		return win.YT.Player;
	}

	_hasPlayer() {
		return (win.YT && win.YT.Player);
	}

	_loadPlayer() {
		var
			self = this,
			tag = doc.createElement('script'),
			script = doc.getElementsByTagName('script')[0]
		;

		tag.src = self.options.url;
		tag.type = 'text/javascript';
		tag.async = true;
		script.parentNode.insertBefore(tag, script);

		return self._getDeffered();
	}

	_getDeffered() {
		this._deferred = this._deferred || $.Deferred();
		return this._deferred;
	}

	_resolvePlayer() {
		return this._getDeffered().resolve(this._getPlayer());
	}

}

export default ApiLoader;
