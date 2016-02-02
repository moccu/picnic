import $ from 'jquery';
import _ from 'underscore';

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
 * **Attention:**
 * *It's important that the `render()`-function of the configured view-class has
 * to return the reference to itself.*
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

		$(settings.selector, data.root).each(function() {
			if (_.where(views, {el: this}).length === 0) {
				views.push(new settings.viewclass($.extend({
					el: this,
					context: context
				}, settings.viewoptions)).render());
			}
		});

		context.wireValue(settings.namespace, views);

		this.postExecute();
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
