import _ from 'underscore';


class Command {
	execute() {
		var
			win = window,
			data = this.eventData
		;

		if (!data.category) {
			throw new Error('Missing category for trackevent call');
		}

		if (!data.action) {
			throw new Error('Missing action for trackevent call');
		}

		if (data.value && !data.label) {
			throw new Error('The add a label for trackevent call when sending a value');
		}

		if (data.value && !_.isNumber(data.value)) {
			throw new Error('The value to send must be type of number for trackevent call');
		}

		if (win.ga) {
			win.ga(
				'send',
				'event',
				data.category,
				data.action,
				data.label,
				data.value
			);
		}
	}
}

export default Command;
