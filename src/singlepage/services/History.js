import $ from 'jquery';
import Link from 'picnic/singlepage/utils/Link';


var
	DEFAULTS = {
		global: window,
		document: document,
		apiname: 'history'
	}
;


class Service {

	constructor(options) {
		var href = window.location.href;
		options = $.extend({}, DEFAULTS, options);

		this._context = options.context;
		this._eventName = options.eventName;
		this._apiname = options.apiname;
		this._global = options.global;
		this._document = options.document;
		this._options = options;

		// This flag stores whether the singlepage mechanism failed before. To
		// keep the users browsing history clean, we will fall back to a
		// 'default' page reloads until any history api calls failed...
		this._failedInThePast = false;

		try {
			this._global[this._apiname].replaceState({href: href}, undefined, href);
			$(this._global).on('popstate', $.proxy(this._onPopState, this));
		} catch (error) {
			this._failedInThePast = true;
		}
	}

	navigate(href, title) {
		var link = new Link(href);

		if (this._failedInThePast) {
			// Simple page reload, the history api didn't worked well before...
			this._alternativeNavigation(link);
			return;
		}

		try {
			this._global[this._apiname].pushState({href: link.href}, title, link.href);

			if (title) {
				this._document.title = title;
			}
		} catch (error) {
			// Something failed, try to navigate with browsers 'default' behavior.
			this._alternativeNavigation(link);
		}

	}

	_alternativeNavigation(link) {
		this._global.location.href = link.href;
	}

	_onPopState(event) {
		var
			state = event.originalEvent.state || {},
			href = state.href || window.location.href
		;

		this._context.dispatch(this._eventName, {
			href: href,
			keepState: true
		});
	}

}

Service.isSupported = function() {
	return !!window.history &&
		typeof window.history.pushState === 'function' &&
		typeof window.history.replaceState === 'function' &&
		'onpopstate' in window;
};

export default Service;
