import $ from 'jquery';


var
	REGEX_LOCAL = /^\/[\w|\-]/,
	REGEX_OUTBOUND = /^(https?:)?\/\//i,
	DEFAULTS = {
		root: 'body',
		selector: 'a',
		regexDomain: window.RegExp('^(https?:)?\/\/[^/]*\.?' + window.location.hostname + '(\/)?', 'i'),
		eventName: 'outbound:open',
		eventData: {
			category: 'outbound',
			action: 'link'
		}
	}
;


/**
 * A service to handle clicks on outgoing links. When the user performs such an
 * action, this service triggers an event which can be handled by commands or
 * other tracking services.
 *
 * @class Tracking-Outbound
 */
class Service {

	/**
	 * Creates an instance of the outbound service.
	 *
	 * @constructor
	 * @param {object} options The settings for the service.
	 * @param {context} options.context The reference to the
	 *		backbone.geppetto context.
	 * @param {string} options.root The selector where to attach a clickhandler
	 *		and manage all elements from (options.selector).
	 *		The default value is: 'body'
	 * @param {string} options.selector The selector where to check outgoing
	 *		links. The default selector/value is: 'a' (all links).
	 * @param {RegExp} options.regexDomain A regular expression for links which
	 *		matches the current domain and/or subdomains and wont be treated as
	 *		outgoing link. The default value is based on the current
	 *		location.hostname including any subdomain.
	 * @param {string} options.eventName The event to fire when an outgoing link
	 *		is clicked. The default value is: 'outbound:open'
	 * @param {object} options.eventData The event data to be send when an
	 *		outgoing link is clicked. The default value is prefilled with our
	 *		generic use for googleanalytics eventtracking with the values in
	 *		'options.eventData.category' and 'options.eventData.action'.
	 * @param {string} options.eventData.category The default value is 'outbound'
	 * @param {string} options.eventData.action The default value is 'link'
	 */
	constructor(options) {
		var self = this;
		self.options = options = $.extend({}, DEFAULTS, options);

		if (!options.context) {
			throw new Error('Give context to Outbound Service');
		}

		self.context = options.context;

		$(options.root)
			.on('click.outbound', options.selector, $.proxy(self._onClick, self));
	}

	_isValid(href) {
		return !REGEX_LOCAL.test(href) && // The link is not local
				!this.options.regexDomain.test(href) && // The link is not on domain which matches regexp
				REGEX_OUTBOUND.test(href); // The link starts with http:// or https:// or //
	}

	_onClick(event) {
		var
			self = this,
			target = event.currentTarget,
			href = target.getAttribute('href') || ''
		;

		if (self._isValid(href)) {
			self.context.dispatch(
				self.options.eventName,
				$.extend({}, self.options.eventData, {label: href})
			);
		}
	}

}

export default Service;
