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

	play() {
		this.callMethod('play');
	}

	pause() {
		this.callMethod('pause');
	}

	unload() {
		this.callMethod('unload');
	}

	on() {}

	off() {}

	callMethod(name) {
		window.Vimeo.callMethod = name;
	}
}

export default MockPlayer;
