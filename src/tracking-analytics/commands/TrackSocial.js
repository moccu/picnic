class Command {
	execute() {
		var
			win = window,
			data = this.eventData
		;

		if (!data.network) {
			throw new Error('Missing network for tracksocial call');
		}

		if (!data.action) {
			throw new Error('Missing action for tracksocial call');
		}

		if (data.pagePathUrl && !data.targetUrl) {
			throw new Error('The add a targetUrl for trackevent call when sending a pagePathUrl');
		}

		if (win.ga) {
			win.ga(
				'send',
				'social',
				data.network,
				data.action,
				data.targetUrl,
				data.pagePathUrl
			);
		}
	}
}

export default Command;
