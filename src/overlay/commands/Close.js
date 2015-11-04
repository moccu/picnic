var
	WIRING_OVERLAY = 'overlay:view'
;

class Command {
	execute() {
		if (this.context.hasWiring(WIRING_OVERLAY)) {
			var view = this.context.getObject(WIRING_OVERLAY);
			view.destroy();

			if (view.hasClickblocker) {
				this.context.dispatch('clickblocker:close', {key: 'overlay'});
			}

			this.context.release(WIRING_OVERLAY);
		}
	}
}

export default Command;
