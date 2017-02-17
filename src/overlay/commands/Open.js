import View from 'picnic/overlay/views/Overlay';


var
	KEY_OVERLAY = 'overlay',
	WIRING_OVERLAY = KEY_OVERLAY + ':view',
	WIRING_ACTIVE_ELEMENT = KEY_OVERLAY + ':activeelement'
;


class Command {

	execute() {
		var
			context = this.context,
			data = this.eventData,
			content = data.content,
			view
		;

		//save active element before open the overlay to get back to this
		//position when the overlay closes...
		this._storePreviouslyActiveElement();

		// Handle creation of overlay:
		if (context.hasWiring(WIRING_OVERLAY)) {
			//...when an other overlay already exists, simply close the existing
			// one and change the content later on...
			view = context.getObject(WIRING_OVERLAY);
			view.close();
		} else {
			//...create a new instance...
			view = new View({context: context});
			context.wireValue(WIRING_OVERLAY, view);
		}

		// Set optional settings:
		view.reference = data.reference;
		view.options.selectorLabel = this.eventData.selectorLabel || view.options.selectorLabel;
		view.options.selectorDescription = this.eventData.selectorDescription || view.options.selectorDescription;
		view.options.closeTitle = this.eventData.closeTitle || view.options.closeTitle;
		view.options.closeLabel = this.eventData.closeLabel || view.options.closeLabel;

		// Check content is constructable and inherits from Backbone.View
		if (typeof content === 'function' && typeof content.prototype.render === 'function') {
			// TODO: find a better way to test inheritance chain.
			content = new content({
				context: context,
				overlay: view
			});

			content.render();
			content = content.el;
		}

		// Render overlay:
		view.render(content);
		view.open();

		// Set other class names for overlay:
		view.addClass(data.className);

		// Enable clickblocker, when requested:
		this._enableClickblocker(view, data);
	}

	_storePreviouslyActiveElement() {
		if (!this.context.hasWiring(WIRING_ACTIVE_ELEMENT)) {
			this.context.wireValue(WIRING_ACTIVE_ELEMENT, document.activeElement);
		}
	}

	_enableClickblocker(view, data) {
		var clickblocker = !!data.clickblocker;
		view.hasClickblocker = clickblocker;

		if (clickblocker) {
			this.context.dispatch('clickblocker:open', {key: KEY_OVERLAY});
		}
	}

}

export default Command;
