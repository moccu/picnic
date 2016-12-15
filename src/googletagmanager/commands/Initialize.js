import $ from 'jquery';
import _ from 'underscore';
import settingsDefault from 'picnic/googletagmanager/settings';


var
	NAMESPACE_LAYER = 'googletagmanager:layer',
	NAMESPACE_SETTINGS = 'googletagmanager:settings'
;


class Command {

	execute() {
		var
			settings = $.extend({}, settingsDefault),
			layer,
			parent,
			script,
			params
		;

		// Load possible settings from registered plugins:
		if (this.context.hasWiring(NAMESPACE_SETTINGS)) {
			settings = $.extend(settings, this.context.getObject(NAMESPACE_SETTINGS));
		}

		// Test if feature should be enabled or not...
		if (!settings.enabled) {
			// If it's disabled, die here...
			return;
		}

		// Test for missing ID...
		if (typeof settings.id !== 'string') {
			throw new Error('Missing Google Tag Manager ID');
		}

		// Setup layer and inject initial pushes:
		layer = settings.layer;
		window[layer] = window[layer] || [];
		_.each(settings.initialLayerPushs, data => {
			if (_.isObject(data)) {
				window[layer].push(data);
			}
		});
		window[layer].push({
			'gtm.start': new Date().getTime(),
			'event': 'gtm.js'
		});

		// Inject Google Tagmanager Code, jshint and jscs compatible:
		parent = document.getElementsByTagName('script')[0];
		script = document.createElement('script');
		params = layer !== 'dataLayer' ? '&l=' + layer : '';

		script.async = true;
		script.src = settings.source + settings.id + params;
		parent.parentNode.insertBefore(script, parent);

		// Store layer in namespace:
		this.context.wireValue(NAMESPACE_LAYER, window[layer]);
	}

}

export default Command;
