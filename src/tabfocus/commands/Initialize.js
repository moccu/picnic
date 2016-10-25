import $ from 'jquery';
import Initialize from 'picnic/core/commands/Initialize';
import View from 'picnic/tabfocus/views/Tabfocus';


/**
 * This module adds a class to a focused element when it is selected with tab -
 * and tab only. In your CSS first reset the default focus behavior (see
 * example) to get rid of the default focus outline.  To define a focus for tab
 * selection add a class of your choice and give it the desired focus outline.
 *
 * @example
 * 		// CSS
 * 		.js a:focus,
 * 		.js button:focus,
 * 		.js [tabindex]:focus {
 *			outline: 0;
 *		}
 *
 * 		// give it an other focus
 * 		.is-focused {
 *			outline: auto 3px #333333;
 *		}
 *
 * @class Tabfocus
 *
 * @example
 * 		// you can easily adjust the default focusable elements and focus Class with:
 * 		this.wireValue('tabfocus:settings', {
 *			classFocus: 'foobar',
 *			selectorFocusable: 'a'
 *		});
 *
 * 		// Default focus Class is: "is-focused"
 * 		// Default focusable elements are: "a, button, [tabindex]"
 *
 */
class Command extends Initialize {

	get settings() {

		var options = {};

		if (this.context.hasWiring('tabfocus:settings')) {
			options = $.extend(options, this.context.getObject('tabfocus:settings'));
		}

		return {
			namespace: 'tabfocus:views',
			selector: 'body',
			viewclass: View,
			viewoptions: options
		};
	}

}

export default Command;
