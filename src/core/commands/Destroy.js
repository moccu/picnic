import $ from 'jquery';
import _ from 'underscore';


/**
 * A generic command to simply destroy view-modules by defining some
 * settings. The destroyed view(s) will be removes to a given namespace. When
 * there are no further views in the given namespace, the namespace will also
 * be removed from the application context.
 *
 * The mandatory setting to provide is a *namespace*. To see how to use these
 * settings take a look at the `get settings`-getter.
 *
 * When a view (which should be destroyed) has a `destroy()`-function, this
 * function will be called before the view will be removed from the namespace.
 *
 * When wiring a destroy-command on a specific event and dispatch that event,
 * you can pass a "root" element to the event as data to define a specific tree
 * in the DOM where the views should be destroyed. Take a look at the examples to
 * see how it works.
 *
 * @class Destroy-Command
 * @example
 *		import Destroy from 'picnic/core/commands/Destroy';
 *
 *		class Command extends Destroy {
 *
 *			get settings() {
 *				return {
 *					namespace: 'example:views'
 *				};
 *			}
 *
 * 		}
 *
 *		export default Command;
 *
 * @example
 *		import SpecificDestroy from 'app/example/commands/Destroy';
 *
 *		// Pass a DOM-element as root in the eventData...
 *		this.context.wireCommand('example1:event', SpecificDestroy);
 *		this.context.dispatch('example1:event', {root: document.getElementById('example1')});
 *
 *		// Pass a jQuery-element as root in the eventData...
 *		this.context.wireCommand('example2:event', SpecificDestroy);
 *		this.context.dispatch('example2:event', {root: $('.example2')});
 *
 *		// Pass a selector-string as root in the eventData...
 *		this.context.wireCommand('example3:event', SpecificDestroy);
 *		this.context.dispatch('example3:event', {root: '.example3'});
 */
class Command {

	/**
	 * This getter returns the settings-object which is mandatory to destroy a
	 * view-module. The mandatory setting to provide is a *namespace*.
	 *
	 * @example
	 *		get settings() {
	 *			return {
	 *				namespace: 'example:views'
	 *			};
	 *		}
	 */
	get settings() {
		return null;
	}

	/**
	 * Contains all the logic to destroy the module(s). It's not ment to
	 * overwrite this function.
	 */
	execute() {
		this.preExecute();

		var
			views = [],
			self = this,
			data = self.eventData,
			context = self.context,
			settings = self.settings,
			roots = $(data.root || document)
		;

		if (!settings.namespace) {
			throw new Error('Define a namespace');
		}

		if (context.hasWiring(settings.namespace)) {
			views = context.getObject(settings.namespace);

			_.each(roots, function(root) {

				var
					index = 0,
					view
				;

				while (index < views.length) {
					view = views[index];

					// Check, if current view is in given root element...
					if ($.contains(root, view.el)) {

						if (this.beforeEach(view)) {
							// Call destroy method on view...
							if (typeof view.destroy === 'function') {
								view.destroy();
							}

							// Remove view from wired views...
							views.splice(index, 1);

							this.afterEach(view);
						} else {
							index++;
						}

					} else {
						index++;
					}
				}

			}, this);


			// When there are no existing views, remove the namespace...
			if (!views.length) {
				context.release(settings.namespace);
			}
		}

		this.postExecute();
	}

	/**
	 * Overwrite this function to add functionality before each view will be
	 * destroyed. If you like to cleanup data or references depending on each
	 * view, you can overwrite this function to do this.
	 *
	 * You can use this function to stop further actions for this view by
	 * returning "false". By default, this function returns "true".
	 *
	 * @param {Backbone.View} view is the view instance before .destroy() will
	 * be called on it.
	 * @return {Boolean} indicates if the view should be destroyed. Default value
	 * is "true" which means the view will be destroyed.
	 */
	beforeEach(/* view*/) {
		// Overwrite this...
		return true;
	}

	/**
	 * Overwrite this function to add functionality after each view has been
	 * destroyed. If you like to cleanup data or references depending on each
	 * view, you can overwrite this function to do this.
	 *
	 * @param {Backbone.View} view is the view instance after .destroy() was
	 * be called on it.
	 */
	afterEach(/* view, */) {
		// Overwrite this...
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
