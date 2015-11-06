import $ from 'jquery';


var
	win = window,
	DEFAULTS = {
		autostart: true,
		tick: 10 * 1000, //10 Seconds
		end: 3 * 60 * 1000, // 3 Minutes
		eventName: 'bounceservice:tick',
		eventData: {}
	}
;


/**
 * A service to which fires an event based on a continuous tick. This tick event
 * can be handled by commands or other tracking services.
 *
 * @class Tracking-Bounce
 */
class Service {

	/**
	 * Creates an instance of the bounce service.
	 *
	 * @constructor
	 * @param {object} options The settings for the service.
	 * @param {context} options.context The reference to the
	 *		backbone.geppetto context.
	 * @param {number} options.tick The time to pause between each tick in
	 *		milliseconds. Default value is 10000ms / 10s
	 * @param {number} options.end The duration until the service should stop to
	 *		fire events. The end time will be calulated based on this value on
	 *		start of the first tick. (see options.autostart or method .start()
	 *		for more details). The value is defined in milliseconds. Default
	 *		value is 180000ms / 3min. When setting this value to Infinity the
	 *		service will run for ever until .reset() is called.
	 * @param {boolean} options.autostart Defines if the tick should start right
	 *		after instantiation of the service. The default value is 'true'.
	 *		When set to 'false' the service must me manually started by calling
	 *		.start() on the instance.
	 * @param {string} options.eventName The event to fire on each tick.
	 *		The default value is: 'bounceservice:tick'
	 * @param {object} options.eventData The event data to be send when a tick
	 *		appears.
	 */
	constructor(options) {
		options = $.extend({}, DEFAULTS, options);

		if (!options.context) {
			throw new Error('Give context to Bounce Service');
		}

		if (typeof options.end !== 'number' || (typeof options.end === 'number' && options.end <= 0)) {
			throw new Error('The end option in Bounce Service must be a positiv number (not 0) or Infinity');
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

	/**
	 * This function starts the tick interval of the service. The final end will
	 * be calculated when calling this function based on the given end-option.
	 */
	start() {
		var
			self = this,
			options = self.options
		;

		if (!self._interval) {
			self._end = (new Date()).getTime() + options.end;
			self._interval = win.setInterval(
				$.proxy(self._onTick, self),
				options.tick
			);
		}
	}

	/**
	 * This function stops the tick interval of the service.
	 */
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
