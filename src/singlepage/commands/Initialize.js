import $ from 'jquery';
import Initialize from 'picnic/core/commands/Initialize';
import Navigate from 'picnic/singlepage/commands/Navigate';
import Service from 'picnic/singlepage/services/History';
import View from 'picnic/singlepage/views/Singlepage';
import settings from 'picnic/singlepage/settings';


class Command extends Initialize {

	preExecute() {
		this._settings = $.extend({}, settings.defaults);

		// Load possible custom settings:
		if (this.context.hasWiring(settings.namespaceSettings)) {
			this._settings = $.extend(this._settings, this.context.getObject(settings.namespaceSettings));
		}
	}

	get settings() {
		return {
			namespace: settings.namespaceViews,
			selector: this._settings.selectorView,
			viewclass: View,
			viewoptions: {
				observeSelector: this._settings.selectorObserve,
				updateSelector: this._settings.selectorUpdate,
				eventName: this._settings.eventNameNavigate
			}
		};
	}

	execute() {
		// Check that the singlepage feature is only initialized once...
		if (!this.context.hasWiring(settings.namespaceService)) {
			// Check if functionality is supported by browser...
			if (Service.isSupported()) {
				super.execute();
			}
		}
	}

	postExecute() {
		this.context.wireCommand(this._settings.eventNameNavigate, Navigate);
		this.context.wireCommand(this._settings.eventNameTranslateIn, this._settings.translateIn);
		this.context.wireCommand(this._settings.eventNameTranslateOut, this._settings.translateOut);
		this.context.wireValue(settings.namespaceService, new Service({
			context: this.context,
			eventName: this._settings.eventNameNavigate
		}));
	}

}

export default Command;
