class MockPlayer {
	constructor(el, options) {
		this.el = el;
		this.options = options;
		this.iframe = document.createElement('iframe');
		this.el.appendChild(this.iframe);
	}

	ready() {
		return Promise.resolve();
	}

	on() {}
}

export default MockPlayer;
