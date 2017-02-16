import $ from 'jquery';


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
		var d = $.Deferred();
		this.isReady = true;
		d.resolve(this.isReady);
		return d;
	}

	triggerProgress() {
		this.time += 1000;
	}

	getCurrentTime() {
		var d = $.Deferred();
		d.resolve(this.time);
		return d;
	}

	getDuration() {
		var d = $.Deferred();
		d.resolve(this.duration);
		return d;
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
