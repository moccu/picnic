import TrackBase from 'picnic/googletagmanager/commands/TrackBase';


class Command extends TrackBase {

	execute() {
		if (!this.eventData.network) {
			throw new Error('Missing network for tracksocial call');
		}

		if (!this.eventData.action) {
			throw new Error('Missing action for tracksocial call');
		}

		this.push({
			event: this.settings.tracksocialName,
			socialNetwork: this.eventData.network,
			socialAction: this.eventData.action,
			socialTarget: this.eventData.targetUrl
		});
	}
}

export default Command;
