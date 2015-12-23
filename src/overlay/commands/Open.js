import View from 'picnic/overlay/views/Overlay';


var
	WIRING_OVERLAY = 'overlay:view'
;


class Command {
	execute() {
		var
			context = this.context,
			data = this.eventData,
			view
		;

		if (context.hasWiring(WIRING_OVERLAY)) {
			view = context.getObject(WIRING_OVERLAY);
			view.close();
		} else {
			view = new View({context: context});
			context.wireValue(WIRING_OVERLAY, view);
		}

		// Set optional settings:
		this._optionReference(view, data);

		// Render overlay:
		view.render(data.content);

		// Set other optional settings:
		this._optionClass(view, data);
		this._optionClickblocker(view, data);
	}
		view.open();

	_optionReference(view, data) {
		view.reference = data.reference;
	}

	_optionClass(view, data) {
		view.addClass(data.className);
	}

	_optionClickblocker(view, data) {
		var clickblocker = !!data.clickblocker;
		view.hasClickblocker = clickblocker;

		if (clickblocker) {
			this.context.dispatch('clickblocker:open', {key: 'overlay'});
		}
	}
}

export default Command;
