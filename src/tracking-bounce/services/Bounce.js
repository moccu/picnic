import $ from 'jquery';


var
	win = window,
	DEFAULTS = {
		autostart: true,
		eventName: 'bounceservice:tick',
		eventData: {},
		getEnd: function() {
			return (new Date()).getTime() + 3 * 60 * 1000; // 3 Minutes
		},
		tick: 10 * 1000 //10 Seconds
	}
;


class Service {

	constructor(options) {
		options = $.extend({}, DEFAULTS, options);

		if (!options.context) {
			throw new Error('Give context to Bounce Service');
		}

		if (typeof options.getEnd !== 'function') {
			throw new Error('The ent option in Bounce Service must be a Function to evalute the end Time');
		}

		if (typeof options.tick !== 'number' || options.tick < 1) {
			throw new Error('The tick option in Bounce Service must be a positiv number');
		}

		this.options = options;
		this.context = options.context;

		if (options.autostart) {
			this.start();
		}
	}

	start() {
		var
			self = this,
			options = self.options
		;

		if (!self._interval) {
			self._end = options.getEnd();
			self._interval = win.setInterval(
				$.proxy(self._onTick, self),
				options.tick
			);
		}
	}

	reset() {
		var self = this;
		if (self._interval) {
			win.clearInterval(self._interval);
			self._interval = undefined;
			self._end = undefined;
			delete(self._interval);
			delete(self._end);
		}
	}

	_onTick() {
		var
			self = this,
			options = self.options,
			now = (new Date()).getTime()
		;

		if (self._end) {
			if (now <= self._end) {
				self.context.dispatch(
					options.eventName,
					options.eventData
				);
			} else {
				self.reset();
			}
		}
	}

}

export default Service;
