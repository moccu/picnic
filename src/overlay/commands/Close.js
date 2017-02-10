var
	WIRING_OVERLAY = 'overlay:view',
	WIRING_ACTIVE_ELEMENT = 'overlay:activeelement'
;

class Command {
	execute() {
		if (this.context.hasWiring(WIRING_OVERLAY)) {
			var view = this.context.getObject(WIRING_OVERLAY);
			view.destroy();

			if (view.hasClickblocker) {
				this.context.dispatch('clickblocker:close', {key: 'overlay'});
			}

			if (this.context.hasWiring(WIRING_ACTIVE_ELEMENT)) {
				this.context.getObject(WIRING_ACTIVE_ELEMENT).focus();
				this.context.release(WIRING_ACTIVE_ELEMENT);
			}

			this.context.release(WIRING_OVERLAY);
		}
	}
}

export default Command;
