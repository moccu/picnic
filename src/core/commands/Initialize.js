import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';


/**
 * A generic command to simply initialize view-modules by defining some
 * settings. The created view(s) will be wired to a given namespace and can be
 * accessed later on through the application context.
 *
 * The three mandatory settings to provide are:
 *
 * * viewclass
 * * selector
 * * namespace
 *
 * To see how to use these settings take a look at the `get settings`-getter.
 *
 * When wiring a initialize-command on a specific event and dispatch that event,
 * you can pass a "root" element to the event as data to define a specific tree
 * in the DOM where the views should be initialized. Take a look at the
 * examples to see how it works.
 *
 * **Attention:**
 * *It's important that the `render()`-function of the configured view-class has
 * to return a reference to itself.*
 *
 * @class Initialize-Command
 * @example
 *		import Initialize from 'picnic/core/commands/Initialize';
 *		import View from 'app/modules/example/views/Example';
 *
 *		class Command extends Initialize {
 *
 *			get settings() {
 *				return {
 *					selector: '.example',
 *					namespace: 'example:views',
 * 					viewclass: View
 *				};
 *			}
 *
 * 		}
 *
 *		export default Command;
 *
 * @example
 *		import SpecificInitialize from 'app/example/commands/Initialize';
 *
 *		// Pass a DOM-element as root in the eventData...
 *		this.context.wireCommand('example1:event', SpecificInitialize);
 *		this.context.dispatch('example1:event', {root: document.getElementById('example1')});
 *
 *		// Pass a jQuery-element as root in the eventData...
 *		this.context.wireCommand('example2:event', SpecificInitialize);
 *		this.context.dispatch('example2:event', {root: $('.example2')});
 */
class Command {

	/**
	 * This getter returns the settings-object which is mandatory to create a
	 * view-module. The three mandatory settings to provide are: *viewclass*,
	 * *selector* and *namespace*.
	 * There is also the possebility to pass multiple other options to the view
	 * backbone-view constructor by adding a `viewoptions` property into the
	 * settings-object. This property should be defined as object. All
	 * properties inside this object are passed into the created backbone-view
	 * as options.
	 *
	 * @example
	 *		// The basic setup of the settings-getter:
	 *		get settings() {
	 *			return {
	 *				selector: '.example',
	 *				namespace: 'example:views',
	 * 				viewclass: View
	 *			};
	 *		}
	 *
	 * @example
	 *		// You can pass other options to the view by defining the
	 *		// 'viewoptions' property. This can look like:
	 *		get settings() {
	 *			return {
	 *				selector: '.example',
	 *				namespace: 'example:views',
	 * 				viewclass: View,
	 *				viewoptions: {
	 *					model: new Backbone.Model(),
	 *					name: 'example'
	 *				}
	 *			};
	 *		}
	 */
	get settings() {
		return null;
	}

	/**
	 * Contains all the logic to initialize the module(s). It's not ment to
	 * overwrite this function.
	 */
	execute() {
		this.preExecute();

		var
			views = [],
			self = this,
			data = self.eventData,
			context = self.context,
			settings = self.settings
		;

		if (!settings.viewclass) {
			throw new Error('Define a view class');
		}

		if (!settings.selector) {
			throw new Error('Define a selector');
		}

		if (!settings.namespace) {
			throw new Error('Define a namespace');
		}

		if (context.hasWiring(settings.namespace)) {
			views = context.getObject(settings.namespace);
		}

		$(settings.selector, data.root).each(function(index) {
			if (_.where(views, {el: this}).length === 0) {
				var
					options = $.extend({el: this, context: context}, settings.viewoptions),
					result,
					view
				;

				result = self.beforeEach(options, this, index);
				if (!_.isBoolean(result)) {
					throw new Error('The return value of beforeEach() must be a boolean.');
				} else if (!result)  {
					return;
				}

				view = new settings.viewclass(options).render();

				if (!(view instanceof Backbone.View)) {
					throw new Error('The view instance is not a backbone view. Did you return the instance on render()-calls?');
				}

				result = self.afterEach(view, this, index);
				if (!_.isBoolean(result)) {
					throw new Error('The return value of afterEach() must be a boolean.');
				} else if (!result)  {
					return;
				}

				views.push(view);
			}
		});

		context.wireValue(settings.namespace, views);

		this.postExecute();
	}

	/**
	 * Overwrite this function to add functionality before each view will be
	 * created. If you like to modify options for each view depending on element
	 * or index, you can overwrite this function to do this.
	 *
	 * You can use this function to stop further actions for this element by
	 * returning "false". By default, this function returns "true". This
	 * function must return a boolean.
	 *
	 * @param {Object} object are the current options which will be passed
	 * into the upcoming created view.
	 * @param {Element} element is the DOM-element on which the view will be
	 * rendered.
	 * @param {Number} index is the current index of all matched DOM-elements.
	 * @return {Boolean} indicates if the view should be created. Default value
	 * is "true" which means the view will be created and rendered.
	 */
	beforeEach(/* options, element, index */) {
		// Overwrite this...
		return true;
	}

	/**
	 * Overwrite this function to add functionality after each view was
	 * created. If you like to call functions or set properties for each new
	 * view depending on element or index, you can overwrite this function to
	 * do this.
	 *
	 * You can use this function to stop further actions for this view by
	 * returning "false". By default, this function returns "true". This
	 * function must return a boolean.
	 *
	 * @param {Backbone.View} view is the newly create view.
	 * @param {Element} element is the DOM-element on which the view was created.
	 * @param {Number} index is the current index of all matched DOM-elements.
	 * @return {Boolean} indicates if the view should added into the list of
	 * created views stored in the given namespace "settings.namespace". Default
	 * value is "true" which means it will be added.
	 */
	afterEach(/* view, element, index */) {
		// Overwrite this...
		return true;
	}

	/**
	 * Overwrite this function to add functionality before the initialization
	 * of the module(s) start...
	 */
	preExecute() {
		// Overwrite this...
	}

	/**
	 * Overwrite this function to add functionality after the initialization
	 * of the module(s)...
	 */
	postExecute() {
		// Overwrite this...
	}

}

export default Command;
