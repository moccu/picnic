import $ from 'jquery';

var DEFAULTS = {
	url: 'https://player.vimeo.com/api/player.js'
};

class ApiLoader {

	constructor(options) {
		this.options = $.extend({}, DEFAULTS, options);
	}

	requestPlayer() {
		var self = this;

		// If player api was already loaded
		if (self._hasPlayer()) {
			return self._getPlayer();
		}

		// Append player api script
		$.getScript(self.options.fallback, function() {
			self._getPlayer();
		});

		return self._getDeferred();
	}

	_hasPlayer() {
		return (window.Vimeo && window.Vimeo.Player);
	}

	_getPlayer() {
		return this._getDeferred().resolve(window.Vimeo.Player);
	}

	_getDeferred() {
		this._deferred = this._deferred || $.Deferred();
		return this._deferred;
	}

}

export default ApiLoader;
