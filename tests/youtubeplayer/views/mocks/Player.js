class MockPlayer {

	constructor(el, settings) {
		this.el = el;
		this.settings = settings;
		this.iframe = document.createElement('iframe');

		this.el.appendChild(this.iframe);

		window.YT.playerInstances = window.YT.playerInstances || [];
		window.YT.playerInstances.push(this);

	}

	triggerReady() {
		this.settings.events.onReady();
		this.settings.events.onStateChange({data: window.YT.PlayerState.PLAYING});
	}

	triggerProgress() {
		this.time = this.time || 0;
		this.time += 1000;
	}

	getIframe() {
		return this.iframe;
	}

	playVideo() {
		this.settings.events.onStateChange({data: window.YT.PlayerState.PLAYING});
	}

	pauseVideo() {
		this.settings.events.onStateChange({data: window.YT.PlayerState.PAUSED});
	}

	stopVideo() {
		this.settings.events.onStateChange({data: window.YT.PlayerState.ENDED});
	}

	getCurrentTime() {
		return this.time || 0;
	}

	getDuration() {
		return 10000;
	}
}

export default MockPlayer;
