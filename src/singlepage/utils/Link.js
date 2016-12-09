import $ from 'jquery';
import _ from 'underscore';

var
	TARGET_SELF = '_self',
	TARGET_BLANK = '_blank',
	TARGET_PARENT = '_parent',
	TARGET_TOP = '_top',
	PROTOCOL_SECURE = 'https:',
	PROTOCOL_INSECURE = 'http:',
	REGEXP_MAILTO = /^mailto\:/,
	REGEXP_JAVASCRIPT = /^javascript\:/,
	DEFAULTS = {
		location: window.location
	}
;


function __deserializeSearch(search) {
	var queries = [];
	search = search || '';
	search = search.indexOf('?') === 0 ? search.substr(1) : search;
	search = search.split('&');
	_.each(search, function(pairs) {
		pairs = pairs.split('=');
		queries.push({name: pairs[0], value: pairs.length === 2 ? pairs[1] : ''});
	});
	return queries;
}


class Link {

	constructor(value, options) {
		var element = value;

		if (typeof element === 'string') {
			element = document.createElement('a');
			element.href = value;
			element.target = TARGET_SELF;
		}

		if (!(element instanceof window.HTMLAnchorElement)) {
			throw new Error('Pass a location string or HTMLAnchorElement into the Link instance');
		}

		this._element = element;
		this._options = $.extend({}, DEFAULTS, options);
	}

	get href() {
		// In case there is no href attribute on an HTMLAnchorElement the value
		// of .href is === "". In this case we will return the current location
		// of the page.
		var href = this._element.href;
		return !href ? this._options.location.href : href;
	}

	get protocol() {
		return this._element.protocol;
	}

	get hostname() {
		return this._element.hostname;
	}

	get port() {
		return this._element.port;
	}

	get pathname() {
		return this._element.pathname;
	}

	get search() {
		return this._element.search;
	}

	get hash() {
		return this._element.hash;
	}

	get target() {
		return this._element.getAttribute('target') || TARGET_SELF;
	}

	get title() {
		return this._element.getAttribute('title');
	}

	get isSecure() {
		return this.protocol.toLowerCase() === PROTOCOL_SECURE;
	}

	get isInsecure() {
		return this.protocol.toLowerCase() === PROTOCOL_INSECURE;
	}

	get isDownload() {
		var prop = this._element.getAttribute('download');
		return typeof prop === 'string';
	}

	get hasHash() {
		var hash = this.hash;
		return typeof hash === 'string' && !!hash.length;
	}

	get hasSearch() {
		var search = this.search;
		return typeof search === 'string' && !!search.length;
	}

	get isSameProtocol() {
		return this.protocol === this._options.location.protocol;
	}

	get isSameHostname() {
		return this.hostname === this._options.location.hostname;
	}

	get isSamePort() {
		return this.port === this._options.location.port;
	}

	get isSamePathname() {
		return this.pathname === this._options.location.pathname;
	}

	get isSameSearch() {
		var
			queriesLink = __deserializeSearch(this.search),
			queriesLocation = __deserializeSearch(this._options.location.search),
			isSame = queriesLink.length === queriesLocation.length
		;

		while (isSame && !!queriesLink.length) {
			isSame = _.where(queriesLocation, queriesLink.shift()).length === 1;
		}

		return isSame;
	}

	get isSameHash() {
		return this.hash === this._options.location.hash;
	}

	get isTargetSelf() {
		return this.target.toLowerCase() === TARGET_SELF;
	}

	get isTargetBlank() {
		return this.target.toLowerCase() === TARGET_BLANK;
	}

	get isTargetParent() {
		return this.target.toLowerCase() === TARGET_PARENT;
	}

	get isTargetTop() {
		return this.target.toLowerCase() === TARGET_TOP;
	}

	get isMailTo() {
		return REGEXP_MAILTO.test(this.href);
	}

	get isJavaScript() {
		return REGEXP_JAVASCRIPT.test(this.href);
	}

}

export default Link;
