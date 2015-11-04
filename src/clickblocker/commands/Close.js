var
	WIRING_CLICKBLOCKER = 'clickblocker:view'
;

class Command {
	execute() {
		var
			self = this,
			view
		;

		if (!self.eventData.key) {
			throw new Error(
				'To close a clickblocker, provide a "key" as eventData to ' +
				'control closing by this given "key"-value.'
			);
		}

		if (self.context.hasWiring(WIRING_CLICKBLOCKER)) {
			view = self.context.getObject(WIRING_CLICKBLOCKER);
			if (view.getKey() === self.eventData.key) {
				view.destroy();
				self.context.release(WIRING_CLICKBLOCKER);
			}
		}
	}
}

export default Command;
