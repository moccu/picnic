import OpenCommand from 'picnic/clickblocker/commands/Open';
import CloseCommand from 'picnic/clickblocker/commands/Close';


/**
 * A module including commands and view to generate a clickblocker by calling
 * events on geppetto context.
 *
 * The initialize command wires two commands to the context to open and close
 * the clickblocker. The events to trigger those commands are
 * 'clockblocker:open' and 'clockblocker:close'.
 *
 * This initialize command offers the possibility, when executing this command
 * more than once, the initialization process itself is performed only once. So
 * there are no duplicate wirings for the 'clockblocker:open'- or
 * 'clockblocker:close'-event.
 *
 * @class Clickblocker
 * @example
 *		// Open a clickblocker:
 *		context.dispatch('clickblocker:open', {
 *			// The key which is required to open an clickblocker. The key will
 *			// be used to close the clickblocker. It describes the owner of the
 *			// clickblocker. This prevents multiple openes and closes of the
 *			// clickblocker. The key is a string.
 *			key: 'example-key'
 *		});
 *
 * @example
 *		// Close an existing clickblocker
 *		context.dispatch('clickblocker:close', {
 *			// The key which was previously used to open the clickblocker is
 *			// required to close that clickblocker.
 *			key: 'example-key'
 *		});
 */
class Command {

	execute() {
		if (!this.called) {
			this.context.wireCommand('clickblocker:open', OpenCommand);
			this.context.wireCommand('clickblocker:close', CloseCommand);
		}

		this.incCount();
	}

	get called() {
		return Command.called;
	}

	incCount() {
		Command.incCount();
	}

}

// Adding the callcount feature into the command-class:
// -----------------------------------------------------------------------------
var __callcount = 0;

Object.defineProperty(Command, 'callcount', {
	get: function() { return __callcount; }
});

Object.defineProperty(Command, 'called', {
	get: function() { return __callcount > 0; }
});

Command.resetCount = function() { __callcount = 0; };

Command.incCount = function() { __callcount++; };

export default Command;
