import $ from 'jquery';
import _ from 'underscore';
import settingsDefault from 'picnic/googletagmanager/settings';


var
	NAMESPACE_LAYER = 'googletagmanager:layer',
	NAMESPACE_SETTINGS = 'googletagmanager:settings'
;


class Command {

	get settings() {
		var settings = $.extend({}, settingsDefault);

		if (this.context.hasWiring(NAMESPACE_SETTINGS)) {
			settings = $.extend(settings, this.context.getObject(NAMESPACE_SETTINGS));
		}

		return settings;
	}

	get layer() {
		var layer = window[this.settings.layer] || [];

		if (this.context.hasWiring(NAMESPACE_LAYER)) {
			layer = this.context.getObject(NAMESPACE_LAYER);
		}

		window[this.settings.layer] = layer;
		return layer;
	}

	push(data) {
		var layer = this.layer;

		if (_.isArray(layer) && _.isObject(data)) {
			layer.push(data);
		}
	}

}

export default Command;
