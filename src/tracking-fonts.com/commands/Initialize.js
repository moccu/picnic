import $ from 'jquery';


var
	win = window,
	doc = document,
	NAMESPACE = 'tracking-fonts.com:settings',
	DEFAULTS = {
		source: ('https:' === doc.location.protocol ? 'https:' : 'http:') + '//fast.fonts.net/t/trackingCode.js'
	}
;


class Command {

	execute() {
		var
			context = this.context,
			options = $.extend({}, DEFAULTS),
			element
		;

		// Load possible options from registered plugins:
		if (context.hasWiring(NAMESPACE)) {
			options = $.extend(options, context.getObject(NAMESPACE));
		}

		if (!options.id) {
			throw new Error('Missing "id" for fonts.com tracking');
		}

		// Create script tag to async load tracking code.
		win.MTIProjectId = options.id;
		element = doc.createElement('script');
		element.type = 'text/javascript';
		element.async = true;
		element.src = options.source;
		(doc.getElementsByTagName('head')[0] || doc.getElementsByTagName('body')[0]).appendChild(element);
	}

}

export default Command;
