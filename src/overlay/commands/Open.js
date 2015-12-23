import Backbone from 'backbone';
import View from 'picnic/overlay/views/Overlay';


var
	KEY_OVERLAY = 'overlay',
	WIRING_OVERLAY = KEY_OVERLAY + ':view'
;


class Command {

	execute() {
		var
			context = this.context,
			data = this.eventData,
			content = data.content,
			view
		;

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

		// Check content is constructable and inherits from Backbone.View
		if (typeof content === 'function') {
			// TODO: find a better way to test inheritance chain.
			content = new content({
				context: context,
				overlay: view
			});

			if (content instanceof Backbone.View) {
				content.render();
				content = content.el;
			}
		}

		// Render overlay:
		view.render(content);
		view.open();

		// Set other class names for overlay:
		view.addClass(data.className);

		// Enable clickblocker, when requested:
		this._enableClickblocker(view, data);
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
