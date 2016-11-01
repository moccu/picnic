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
		self._getScript(self.options.url, function() {
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

	_getScript(url, callback) {
        var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            script.onload = function () {
                callback();
            };
        }

        document.getElementsByTagName('head')[0].appendChild(script);
    }

}

export default ApiLoader;
