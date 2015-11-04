import $ from 'jquery';
import ClickblockerView from 'picnic/clickblocker/views/Clickblocker';

var
	$body = $('body'),
	WIRING_CLICKBLOCKER = 'clickblocker:view'
;

class Command {
	execute() {
		if (!this.eventData.key) {
			throw new Error(
				'To open a clickblocker, provide a "key" as eventData to ' +
				'control closing by this given "key"-value.'
			);
		}

		if (!this.context.hasWiring(WIRING_CLICKBLOCKER)) {
			var view = new ClickblockerView({
				context: this.context,
				el: $body,
				key: this.eventData.key
			}).render();
			view.open();

			this.context.wireValue(WIRING_CLICKBLOCKER, view);
		}
	}
}

export default Command;
