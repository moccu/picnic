import _ from 'underscore';
import TrackBase from 'picnic/googletagmanager/commands/TrackBase';


class Command extends TrackBase {

	execute() {
		if (!this.eventData.category) {
			throw new Error('Missing category for trackevent call');
		}

		if (!this.eventData.action) {
			throw new Error('Missing action for trackevent call');
		}

		if (this.eventData.value && !this.eventData.label) {
			throw new Error('Add a label for trackevent call when sending a value');
		}

		if (this.eventData.value && !_.isNumber(this.eventData.value)) {
			throw new Error('The value to send must be type of number for trackevent call');
		}

		this.push({
			event: this.settings.trackeventName,
			eventCategory: this.eventData.category,
			eventAction: this.eventData.action,
			eventLabel: this.eventData.label,
			eventValue: this.eventData.value
		});
	}

}

export default Command;
