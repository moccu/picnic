import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import BaseView from 'picnic/core/views/Base';


/**
 * A generic template view to render an underscore.js template string. The
 * rendered template can be accessed by the property "content" (jQuery object)
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
 *		import TemplateView from 'picnic/core/commands/Initialize';
 *		import Template from 'app/modules/example/views/Example.html!text'
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
 *		import TemplateView from 'picnic/core/commands/Initialize';
 *		import Template from 'app/modules/example/views/Example.html!text'
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

	constructor(options) {
		super(options);

		// This is an initial check wheather the template getter was set or not...
		this.template;
	}

	/**
	 * This is the getter for the required underscore.js template string. This
	 * getter needs to be overwritten when inheriting from this class.
	 *
	 * @return {string} is the underscore.js template string.
	 */
	get template() {
		throw new Error('Define a template by overwrite the "get template()" property of the TemplateView.');
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
	 * @return {DOMElement|jQuery} is the target where to add the rendered content.
	 */
	get target() {
		return this.$el;
	}

	/**
	 * This returns the rendering strategy how to add the created content to a
	 * certain `target`. It supports the following values which map to the
	 * identically named jQuery functions:
	 *
	 * * "appendTo" (default) – TemplateView.STRATEGY_APPEND
	 * * "insertBefore" – TemplateView.STRATEGY_BEFORE
	 * * "insertAfter" – TemplateView.STRATEGY_AFTER
	 *
	 * All jQuery insertion strategies will be used in relation to the `.target`
	 * element
	 *
	 * @return {string} is the jQuery function how to add the rendered content.
	 */
	get strategy() {
		return this.options.strategy || View.STRATEGY_APPEND;
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
			strategy = this.strategy,
			target = $(this.target),
			previous
		;

		// This block allows a re-rendering of the view instance's content
		// at the same DOM position like the previous content was rendered...
		if (this.content) {
			strategy = View.STRATEGY_AFTER;
			target = this.content.off();
			previous = target;
		}

		this.content = $(template(data))[strategy](target);

		// When there was a previous content, remove them from the DOM...
		if (previous) {
			previous.remove();
		}

		return this;
	}

	/**
	 * Destroys this view.
	 */
	destroy() {
		this.content.off().remove();
		super.destroy();
	}

}

View.STRATEGY_APPEND = 'appendTo';
View.STRATEGY_BEFORE = 'insertBefore';
View.STRATEGY_AFTER = 'insertAfter';

export default View;
