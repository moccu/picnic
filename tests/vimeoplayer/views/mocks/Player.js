class MockPlayer {
	constructor(el, options) {
		this.options = options;
		this.iframe = document.createElement('iframe');
		el.appendChild(this.iframe);
		this.element = document.getElementsByTagName('iframe')[0];
	}

	ready() {
		return new Promise(function(resolve) {
			resolve(1);
		});
	}

	getCurrentTime() {
		return new Promise(function(resolve) {
			resolve(1);
		});
	}

	getDuration() {
		return new Promise(function(resolve) {
			resolve(1);
		});
	}

	play() {}

	pause() {}

	unload() {}

	on() {}

	off() {}
}

export default MockPlayer;
