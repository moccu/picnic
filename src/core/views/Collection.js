import _ from 'underscore';
import Backbone from 'backbone';
import TemplateView from 'picnic/core/views/Template';


/**
 * A generic view to render render all models from a collection as list. This
 * view automaticly updates when the collection changes via add, remove, set or
 * reset.
 *
 * The collection view is a simple [Template-View](#Template-View) which renders
 * by default a `<ul>`-list into the given element. All children (models of the
 * collection) will be rendered as `<li>`-elements into the list element.
 *
 * The simplest way to create a childview is to inherit from picnic's
 * [Template-View](#Template-View)
 *
 * @class Collection-View
 * @example
 *		import Backbone from 'backbone';
 *		import CollectionView from 'picnic/core/views/Collection';
 *		import ModelView from 'app/modules/example/views/Model'
 *
 *		var collection = new Backbone.Collection([
 *			{id: 1, title: 'Foo'},
 *			{id: 2, title: 'Bar'}
 *		]);
 *
 *		new CollectionView({
 *			el: document.body,
 *			context: app.context,
 *			childviewclass: ModelView,
 *			collection: collection
 *		}).render();
 *
 */
class View extends TemplateView {

	/**
	 * Creates an instance of this view.
	 *
	 * @constructor
	 * @param {object} options The settings for the view.
	 * @param {context} options.context The reference to the
	 *		backbone.geppetto context.
	 * @param {element|$element} options.el the element reference for a
	 *		backbone.view.
	 * @param {View} options.childviewclass is the reference to the
	 *		class of all child elements.
	 */
	constructor(options) {
		super(options);

		if (!this.collection || !(this.collection instanceof Backbone.Collection)) {
			throw new Error('Provide a backbone collection for the collection view.');
		}

		if (!this.childviewclass) {
			throw new Error('Define a childviewclass for the collection view.');
		}

		_.bindAll(
			this,
			'onReset',
			'onAdd',
			'onRemove'
		);
	}

	/*
	 * This returns the class reference for all child elements. By default it
	 * retuns the `childviewclass` reference which was passed into the
	 * constructor of this class. Override this getter setup your inheriting
	 * collection views to no pass the reference into the constructor.
	 *
	 * @return {View} is the reference to the class of all child elements.
	 */
	get childviewclass() {
		return this.options.childviewclass;
	}

	/*
	 * According to the Backbone.View's `tagName` property, it is possible to
	 * change the tagName of all child views. By default the child views `el`
	 * will be a `<li>` element. Change this getter to change the tagname of
	 * each element.
	 *
	 * @return {string} is the tagname of all child elements.
	 */
	get childtagName() {
		return 'li';
	}

	/**
	 * This returns the reference to the list where all child elements will be
	 * added to. By default it uses the [Template-View](#Template-View)'s
	 * `.content` reference.
	 *
	 * You can override this getter to change the reference depending on the
	 * complexity of your view's `template`.
	 *
	 * @return {$Element} is a jQuery reference to the list element.
	 */
	get list() {
		return this.content;
	}

	/**
	* This is the getter for the required underscore.js template string. By
	* default this returns `<ul />`.
	*
	* @override
	* @return {string} is the underscore.js template string.
	*/
	get template() {
		return super.template || '<ul />';
	}

	/**
	 * This renders the content of this view and all models of the collection.
	 *
	 * @return {view} is the instance of this view.
	 */
	render() {
		this._unbind();
		this._destroyAllChildren();

		super.render();

		this._createAllChildren();
		this._bind();

		return this;
	}

	/**
	 * Destroys this view and all child views.
	 */
	destroy() {
		this._unbind();
		this._destroyAllChildren();

		super.destroy();
	}

	// Bind all events on the collection.
	_bind() {
		this.collection
			.on('reset', this.onReset)
			.on('add', this.onAdd)
			.on('remove', this.onRemove);
	}

	// Un-bind all events on the collection.
	_unbind() {
		this.collection
			.off('reset', this.onReset)
			.off('add', this.onAdd)
			.off('remove', this.onRemove);
	}

	// Returns the instance of the child view by the given model. Otherwise it
	// returns `null`.
	_getChild(model) {
		return _.findWhere(this._children, {model: model}) || null;
	}

	// Retuns a boolean which identifies if a given model has a already
	// rendered.
	_hasChild(model) {
		return !!this._getChild(model);
	}

	// Renders a child view by given model into its correct position in the
	// `.list`.
	_createChild(model) {
		if (!this._hasChild(model)) {
			var
				index = this.collection.indexOf(model),
				child = new this.childviewclass({
					tagName: this.childtagName,
					context: this.context,
					model: model
				}).render()
			;

			if (!this._children.length) {
				this._children.push(child);
				child.$el.appendTo(this.list);
			} else {
				if (index === 0) {
					child.$el.prependTo(this.list);
				} else {
					child.$el.insertAfter(this.list.children().eq(index - 1));
				}

				this._children.splice(index, 0, child);
			}
		}
	}

	// Renders all models from the collection as child views into the `.list`.
	_createAllChildren() {
		this._children = this._children || [];
		this.collection.each(model => {
			this._createChild(model);
		});
	}

	// Destroys and removes the previously rendered child view by the given
	// model.
	_destroyChild(model) {
		var child = this._getChild(model);
		if (child) {
			child.destroy();
			child.remove();
		}
	}

	// Destroys and removes all rendered child views.
	_destroyAllChildren() {
		_.each(this._children, child => {
			child.destroy();
			child.remove();
		});

		this._children = null;
	}

	/*
	 * The default handler which reacts on `reset` events from the collection.
	 */
	onReset() {
		this.render();
	}

	/*
	 * The default handler which reacts on `add` events from the collection.
	 *
	 * @param {model} model is the added model.
	 */
	onAdd(model) {
		this._createChild(model);
	}

	/*
	 * The default handler which reacts on `remove` events from the collection.
	 *
	 * @param {model} model is the removed model.
	 */
	onRemove(model) {
		this._destroyChild(model);
	}

}

export default View;
