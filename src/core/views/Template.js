import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import BaseView from 'picnic/core/views/Base';


/**
 * A generic template view to render an underscore.js template string. The
 * rendered template can be accessed by the property "content" ($element)
 * on each instance of this class.
 *
 * To render a certain template, simply overwrite the "template" getter inside
 * the inheriting class and return an underscore template string.
 *
 * By default, an instance of this view passes the serialized model and
 * collection into the template context.
 *
 * @class Template-View
 * @example
 *		import Backbone from 'backbone';
 *		import TemplateView from 'picnic/core/views/Template';
 *		import Template from 'app/modules/example/views/Example.html!text';
 *
 *		var model = new Backbone.Model({id: 1});
 *
 *		new TemplateView({
 *			el: document.body,
 *			context: app.context,
 *			template: Template,
 *			model: model
 *		}).render();
 *
 * @example
 *		import TemplateView from 'picnic/core/views/Template';
 *		import Template from 'app/modules/example/views/Example.html!text';
 *
 *		class View extends TemplateView {
 *
 *			get template() {
 *				return Template;
 *			}
 *
 * 		}
 *
 *		export default View;
 *
 * @example
 *		import TemplateView from 'picnic/core/views/Template';
 *		import Template from 'app/modules/example/views/Example.html!text';
 *
 *		class View extends TemplateView {
 *
 *			constructor(options) {
 *				super(options);
 *
 *				// Re-render content on model change. Pay attention to remove
 *				// possible eventlisteners from previous content!
 *				this.model.on('change', () => {
 *					this.render();
 *				});
 *			}
 *
 *			get template() {
 *				return Template;
 *			}
 *
 * 		}
 *
 *		export default View;
 */
class View extends BaseView {

	/**
	 * Creates an instance of this view.
	 *
	 * @constructor
	 * @param {object} options The settings for the view.
	 * @param {context} options.context The reference to the
	 *		backbone.geppetto context.
	 * @param {DOMElement|$Element} options.el the element reference for a
	 *		backbone.view.
	 * @param {string} options.template is the underscore.js template string.
	 * @param {string} options.insertMethod allows to change the default rendering
	 *		insertMethod. For more details take a look at the
	 *		`.insertMethod` getter of this class.
	 */
	constructor(options) {
		super(options);

		if (!this.template) {
			throw new Error('Define a template by overwrite the "get template()" property of the TemplateView.');
		}
	}

	/**
	 * This is the getter for the required underscore.js template string. This
	 * getter needs to be overwritten when inheriting from this class.
	 *
	 * @return {string} is the underscore.js template string.
	 */
	get template() {
		return this.options.template;
	}

	/**
	 * This is the getter which retuns the context data for the template. By
	 * default it will return an object, with the serialized model and
	 * collection data, when passed to the constructor of this instance.
	 *
	 * Whether model or collection may be undefined, each property will be null
	 * in the returned object.
	 *
	 * @return {object} is the template context.
	 */
	get data() {
		var data = {
			model: this.model instanceof Backbone.Model ? this.model.toJSON() : this.model || null,
			collection: this.collection instanceof Backbone.Collection ? this.collection.toJSON() : this.collection || null
		};

		return data;
	}

	/**
	 * This getter returns the target where to add the rendered content. By
	 * default it will return the this.$el value of a backbone view. The return
	 * value must be a DOM- or jQuery-element.
	 *
	 * @return {DOMElement|$Element} is the target where to add the rendered content.
	 */
	get target() {
		return this.$el;
	}

	/**
	 * This returns the type of method how to insert the created content to a
	 * certain `target`. It supports the following values which map to the
	 * identically named jQuery functions:
	 *
	 * TemplateView.INSERT_APPENDTO = "appendTo" (default)
	 * TemplateView.INSERT_PREPENDTO = "prependTo"
	 * TemplateView.INSERT_BEFORE = "insertBefore"
	 * TemplateView.INSERT_AFTER = "insertAfter"
	 *
	 * All jQuery insertion methods will be used in relation to the `.target`
	 * element: content[insertMethod](target)
	 *
	 * @return {string} is the jQuery function how to add the rendered content.
	 */
	get insertMethod() {
		return this.options.insertMethod || View.INSERT_APPENDTO;
	}

	/**
	 * This renders the content of this view.
	 *
	 * @return {view} is the instance of this view.
	 */
	render() {
		var
			template = _.template(this.template),
			data = this.data,
			insertMethod = this.insertMethod,
			target = $(this.target),
			previous
		;

		// Removes all of the view's delegated events...
		this.undelegateEvents();

		// This block allows a re-rendering of the view instance's content
		// at the same DOM position like the previous content was rendered...
		if (this.content) {
			insertMethod = View.INSERT_AFTER;
			target = this.content.off();
			previous = target;
		}

		this.content = $(template(data))[insertMethod](target);

		// When there was a previous content, remove them from the DOM...
		if (previous) {
			previous.remove();
		}

		// (Re-)attach all events...
		this.delegateEvents();

		return this;
	}

	/**
	 * Destroys this view.
	 */
	destroy() {
		if (this.content) {
			this.content.off().remove();
			this.content = undefined;
			delete(this.content);
		}
		super.destroy();
	}

}

View.INSERT_APPENDTO = 'appendTo';
View.INSERT_PREPENDTO = 'prependTo';
View.INSERT_BEFORE = 'insertBefore';
View.INSERT_AFTER = 'insertAfter';

export default View;
