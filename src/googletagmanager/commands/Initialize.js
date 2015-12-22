import $ from 'jquery';


var
	win = window,
	doc = document,
	DEFAULTS = {
		enabled: true,
		source: '//www.googletagmanager.com/gtm.js?id=',
		layer: 'dataLayer'
	},
	NAMESPACE_SETTINGS = 'googletagmanager:settings'
;


class Command {

	execute() {
		var
			self = this,
			context = self.context,
			options = $.extend({}, DEFAULTS),
			layer = options.layer,
			parent,
			script,
			params
		;

		// Load possible options from registered plugins:
		if (context.hasWiring(NAMESPACE_SETTINGS)) {
			options = $.extend(options, context.getObject(NAMESPACE_SETTINGS));
		}

		// Test if feature should be enabled or not...
		if (!options.enabled) {
			// If it's disabled, die here...
			return;
		}

		// Test for missing ID...
		if (typeof options.id !== 'string') {
			throw new Error('Missing Google Tag Manager ID');
		}

		// Inject Google Tagmanager Code, jshint and jscs compatible:
		win[layer] = win[layer] || [];
		win[layer].push({
			'gtm.start': new Date().getTime(),
			event: 'gtm.js'
		});

		parent = doc.getElementsByTagName('script')[0];
		script = doc.createElement('script');
		params = layer !== 'dataLayer' ? '&l=' + layer : '';

		script.async = true;
		script.src = options.source + options.id + params;
		parent.parentNode.insertBefore(script, parent);
	}

}

export default Command;
