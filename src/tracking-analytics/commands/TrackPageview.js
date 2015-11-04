class Command {
	execute() {
		var
			win = window,
			data = this.eventData
		;

		if (!data.path) {
			throw new Error('Missing path for trackpageview call');
		}

		if (win.ga) {
			win.ga(
				'send',
				'pageview',
				data.path
			);
		}
	}
}

export default Command;
