import OpenCommand from 'picnic/overlay/commands/Open';
import CloseCommand from 'picnic/overlay/commands/Close';


/**
 * A module including commands and view to generate an overlay by calling events
 * on geppetto context.
 *
 * The initialize command wires two commands to the context to open and close
 * the overlay(s). The events to trigger those commands are 'overlay:open' and
 * 'overlay:close'.
 *
 * This initialize command offers the possibility, when executing this command
 * more than once, the initialization process itself is performed only once. So
 * there are no duplicate wirings for the 'overlay:open'- or
 * 'overlay:close'-event.
 *
 * @class Overlay
 * @example
 *		// Open an overlay:
 *		context.dispatch('overlay:open', {
 *			// The content of the overlay. The content can be type of string
 *			// which will be converted into a HTMLElement, HTMLElement,
 *			// jQuery-Element, Class which inherits Backbone.View.
 *			//
 *			// This param is required
 *			//
 *			// When giving a Class, the class instance will get the context and
 *			// overlay instance into the contructor as properties of the options
 *			// parameter.
 *			content: '<div>Content</div>',
 *			content: document.getElementById('foo'),
 *			content: $('#foo'),
 *			content: FooView,
 *
 *			// The overlay can be visibility attached to an other content
 *			// element by setting this property. The reference value can be type
 *			// of string as a jQuery-Selector, HTMLElement, jQuery-Element.
 *			reference: '#bar',
 *			reference: document.getElementById('bar'),
 *			reference: $('#bar')
 *
 *			// An optional classname which will be attached to the overlay for
 *			// better styling options.
 *			className: 'an-optional-class'
 *
 *			// Optional clickblocker can be enabled by setting this to 'true'.
 *			clickblocker: true
 *
 *			// Optional scrollblocker, will apply an overflow: hidden; style
 *			// property to the overlay target (default: <body>) by setting this
 *			// to 'true'.
 +			scrollblocker: true
 *		});
 *
 * @example
 *		// Close an existing overlay
 *		context.dispatch('overlay:close');
 */
class Command {

	execute() {
		if (!this.called) {
			this.context.wireCommand('overlay:open', OpenCommand);
			this.context.wireCommand('overlay:close', CloseCommand);
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
