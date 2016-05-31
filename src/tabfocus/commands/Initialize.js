import Initialize from 'picnic/core/commands/Initialize';
import View from 'picnic/tabfocus/views/Tabfocus';

/**
 * This module adds a class to an focused element if it was selected with tab. If
 * it was selected with f.e. a clickevent, there will be no focus class on the element.
 * And no focus should be visible. It gets rid the default outline of an
 * tab-enabled element on click.
 *
 * @class Tabfocus
 *
 * @example
 * In your CSS you first have to reset the default focus behaviour:
 *		a,
 *		button,
 *		[tabindex] {
 *			.js &:focus {
 *				outline: 0;
 *			}
 *		}
 *
 * When you reset it no one would see the focus anymore. So add the class of
 * your choise and give it a nice focus outline.
 *
 * @example
 * 		&.is-focused {
 *			border-bottom: 0;
 *			outline: auto 3px rgba(#333333, 0.8);
 *		}
 *
 * You can change "selectorFocusable" and "classFocus" within the options.
 * Default focusable elements are: "a, button, [tabindex]"
 * Default focus Class is: "is-focused"
 */

class Command extends Initialize {

	get settings() {
		return {
			namespace: 'tabfocus:views',
			selector: 'body',
			viewclass: View
		};
	}

}

export default Command;
