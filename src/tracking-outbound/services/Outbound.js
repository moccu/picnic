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


class Service {

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

		if (self._isValid(href)) {
			self.context.dispatch(
				self.options.eventName,
				$.extend({}, self.options.eventData, {label: href})
			);
		}
	}

}

export default Service;
