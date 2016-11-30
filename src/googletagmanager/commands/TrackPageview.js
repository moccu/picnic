import TrackBase from 'picnic/googletagmanager/commands/TrackBase';


class Command extends TrackBase {

	execute() {
		if (!this.eventData.path) {
			throw new Error('Missing path for trackpageview call');
		}

		this.push({
			event: this.settings.trackpageviewName,
			virtualPageURL: this.eventData.path,
			virtualPageTitle: this.eventData.title
		});
	}

}

export default Command;
