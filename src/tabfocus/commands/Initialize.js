import $ from 'jquery';
import Initialize from 'picnic/core/commands/Initialize';
import View from 'picnic/tabfocus/views/Tabfocus';


/**
 * This module adds a class to a focused element when it is selected with tab -
 * and tab only. In your CSS first reset the default focus behavior (see
 * example) to get rid of the default focus outline. To define a focus for tab
 * selection add a class of your choice and give it the desired focus outline.
 *
 * You can easily adjust the default focusable elements selector and focus
 * classname by using the 'tabfocus:settings' key on the geppetto context
 * (see example). These are the properties which can be changed:
 *
 * * `selectorFocusable` – the selector of all DOM elements to handle focus events, default value is `a, button, input, textarea, select, [tabindex]`
 * * `classFocus` – the classname to apply when an element is selected, default value is `is-focused`
 *
 * @class Tabfocus
 * @example
 * 		// CSS, using modernizr to progressively enhance...
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
 * @example
 * 		this.wireValue('tabfocus:settings', {
 *			selectorFocusable: 'a',
 *			classFocus: 'foobar'
 *		});
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
