class MockPlayer {
	constructor(el, options) {
		this.options = options;
		this.iframe = document.createElement('iframe');
		el.appendChild(this.iframe);
		this.element = document.getElementsByTagName('iframe')[0];
		this.time = 0;
		this.duration = 10000;
		this.isReady = false;
		window.Vimeo.callMethod = [];
		window.Vimeo.playerInstances = window.Vimeo.playerInstances || [];
		window.Vimeo.playerInstances.push(this);
	}

	ready() {
		this.isReady = true;
		return Promise.resolve(this.isReady);
	}

	getCurrentTime() {
		this.time = (this.time < this.duration) ? this.time + 1000 : this.duration;
		return Promise.resolve(this.time);
	}

	getDuration() {
		return Promise.resolve(this.duration);
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

	on(eventName) {
		this.callMethod('addEventListener', eventName);
	}

	off(eventName) {
		this.callMethod('removeEventListener', eventName);
	}

	callMethod(name, args) {
		window.Vimeo.callMethod.push(name + ((args) ? ':' + args : ''));
	}
}

export default MockPlayer;
