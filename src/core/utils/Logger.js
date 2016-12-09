/**
 * A generic logger util to print data into the webbrowser's console. The logger
 * requires a modulename for a better sorting/filtering between logging of
 * different modules.
 *
 * @class Logger-Util
 * @example
 *		import Logger from 'picnic/core/utils/Logger';
 *
 *		var logger = new Logger({modulename: 'MyInstance'});
 *		logger.log('Hello world', [1, 2, 3]); // logs: [MyInstance : 1], Hello World, [1, 2, 3]
 *		logger.error('Something went wrong'); // errors: [MyInstance : 2], Something went wrong
 */
class Logger {

	/**
	 * Creates an instance of the logger.
	 *
	 * @constructor
	 * @param {object} options The settings for the view
	 * @param {string} options.modulename The modulename as a reference which
	 *		module initiated the logging call.
	 */
	constructor(options = {}) {
		if (!options.modulename) {
			throw new Error('The logger requires a modulename.');
		}

		this._name = options.modulename;
		this._count = 0;
	}

	get _console() {
		// Be aware that console is present:
		var console = (window.console || {});
		console.log = console.log || function() {};

		return console;
	}

	_send(method = 'log', args = []) {
		this._console[method].apply(
			this._console,
			['[' + this._name + ' : ' + (++this._count) + ']'].concat(
				Array.prototype.slice.call(args)
			)
		);
	}

	/**
	 * This logs the given arguments including the modulename and a count.
	 *
	 * @param {...args} [args] the arguments to log
	 */
	log() {
		this._send('log', arguments);
	}

	/**
	 * This logs an info the given arguments including the modulename and a count.
	 *
	 * @param {...args} [args] the arguments to log as info
	 */
	info() {
		this._send('info', arguments);
	}

	/**
	 * This logs a warning the given arguments including the modulename and a count.
	 *
	 * @param {...args} [args] the arguments to log as warning
	 */
	warn() {
		this._send('warn', arguments);
	}

	/**
	 * This logs an error the given arguments including the modulename and a count.
	 *
	 * @param {...args} [args] the arguments to log as error
	 */
	error() {
		this._send('error', arguments);
	}

}

export default Logger;
