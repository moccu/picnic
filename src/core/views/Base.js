import Backbone from 'backbone';
import Geppetto from 'backbone.geppetto';


/**
 * A generic view which inherits from the Backbone.View. This view is ment to
 * be used by all specific views in a project. It stores the references to all
 * given constructor options in the `.options` property. It also tests for and
 * stores the reference to the Backbone.Geppetto Context instance.
 *
 * @class Base-View
 * @example
 *		import BaseView from 'picnic/core/views/Base';
 *
 *		new BaseView({
 *			el: document.body,
 *			context: app.context
 *		}).render();
 */
class View extends Backbone.View {

	/**
	 * Creates an instance of this view.
	 *
	 * @constructor
	 * @param {object} options The settings for the view.
	 * @param {context} options.context The reference to the
	 *		backbone.geppetto context.
	 * @param {DOMElement|$Element} options.el the element reference for a
	 *		backbone.view.
	 */
	constructor(options) {
		super(options);

		if (!options.context || !(options.context instanceof Geppetto.Context)) {
			throw new Error('Supply the correct context instance.');
		}

		this.context = options.context;
		this.options = options;
	}

	/**
	 * This renders the content of this view and all models of the collection.
	 *
	 * @return {view} is the instance of this view.
	 */
	render() {
		return this;
	}

	/**
	 * Destroys this view.
	 */
	destroy() {
		this.context = undefined;
		this.options = undefined;
		delete(this.context);
		delete(this.options);
	}
}

export default View;
