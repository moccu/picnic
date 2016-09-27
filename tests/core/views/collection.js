/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Backbone from 'backbone';
import CollectionView from 'picnic/core/views/Collection';
import TemplateView from 'picnic/core/views/Template';
import Fixure from 'tests/core/views/fixtures/collection.html!text';


class Collection extends Backbone.Collection {

	comparator(model) {
		return model.get('id');
	}

}

class ChildView extends TemplateView {

	get template() {
		return '<div id="item-<%- model.id %>"><%- model.title %></div>';
	}

}


QUnit.module('The core collection view', {

	beforeEach: function() {
		$(Fixure).appendTo($('#qunit-fixture'));
		this.context = new Geppetto.Context();
		this.collection = new Collection([
			{id: 10, title: 'Foo'},
			{id: 20, title: 'Bar'},
			{id: 30, title: 'Baz'}
		]);
		this.options = {
			el: $('.view')[0],
			context: this.context,
			collection: this.collection,
			childviewclass: ChildView
		};
	}

});

QUnit.test(
	'should fail on instantiation when the "collection" is missing',
	function(assert) {
		assert.throws(function() {
			new CollectionView({
				el: $('.view')[0],
				context: this.context,
				childviewclass: ChildView
			});
		}.bind(this), new Error('Provide a backbone collection for the collection view.'));
	}
);

QUnit.test(
	'should fail on instantiation when the "childviewclass" is missing',
	function(assert) {
		assert.throws(function() {
			new CollectionView({
				el: $('.view')[0],
				context: this.context,
				collection: this.collection
			});
		}.bind(this), new Error('Define a childviewclass for the collection view.'));
	}
);

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		var view = new CollectionView(this.options);
		assert.equal(view.render(), view);
	}
);

QUnit.test(
	'should inherit from template view',
	function(assert) {
		assert.ok(new CollectionView(this.options) instanceof TemplateView);
	}
);

QUnit.test(
	'should render all models in the collection',
	function(assert) {
		var view = new CollectionView(this.options);
		view.render();

		assert.equal($('.view > ul').length, 1);
		assert.equal($('.view > ul > li').length, 3);
		assert.equal($('.view > ul > li:first > div').attr('id'), 'item-10');
		assert.equal($('.view > ul > li:last > div').attr('id'), 'item-30');
	}
);

QUnit.test(
	'should render into a <ul /> template by default',
	function(assert) {
		var view = new CollectionView(this.options);
		view.render();

		assert.equal(view.template, '<ul />');
	}
);

QUnit.test(
	'should return template which was given into constructor options',
	function(assert) {
		var view = new CollectionView($.extend({template: '<ol />'}, this.options));
		view.render();

		assert.equal(view.template, '<ol />');
	}
);

QUnit.test(
	'should return class of childview',
	function(assert) {
		var view = new CollectionView(this.options);
		view.render();

		assert.equal(view.childviewclass, ChildView);
	}
);

QUnit.test(
	'should use tagName for childviews depending on "childtagName" getter',
	function(assert) {
		class TempView extends CollectionView {
			get childtagName() {
				return 'foo';
			}
		}

		var view = new TempView(this.options);
		view.render();

		assert.equal($('.view > ul > foo').length, 3);
	}
);

QUnit.test(
	'should use the "content" of the template view as default "list" reference',
	function(assert) {
		var view = new CollectionView(this.options);
		view.render();

		assert.equal(view.list, view.content);
	}
);

QUnit.test(
	'should add new children into list when added to collection',
	function(assert) {
		var view = new CollectionView(this.options);
		view.render();

		this.collection.add({id: 11, title: 'Puff'}); // Collection is ordered by "id"
		assert.equal($('.view > ul > li:eq(1) > div').attr('id'), 'item-11');
	}
);

QUnit.test(
	'should not rerender other children, when a new model was added to collection',
	function(assert) {
		var
			view = new CollectionView(this.options),
			before
		;

		view.render();
		before = $('.view > ul > li:first')[0];

		this.collection.add({id: 11, title: 'Puff'}); // Collection is ordered by "id"
		assert.equal($('.view > ul > li:first')[0], before, 'Is still the same DOM element');
	}
);

QUnit.test(
	'should remove children from list when removed from collection',
	function(assert) {
		var view = new CollectionView(this.options);
		view.render();

		this.collection.remove(this.collection.at(1)); // Remove second model
		assert.equal($('.view > ul > li').length, 2);
		assert.equal($('.view > ul > li:first > div').attr('id'), 'item-10');
		assert.equal($('.view > ul > li:last > div').attr('id'), 'item-30');
	}
);

QUnit.test(
	'should not rerender other children, when a model was removed from collection',
	function(assert) {
		var
			view = new CollectionView(this.options),
			before
		;

		view.render();
		before = $('.view > ul > li:first')[0];

		this.collection.remove(this.collection.at(1)); // Remove second model
		assert.equal($('.view > ul > li:first')[0], before, 'Is still the same DOM element');
	}
);

QUnit.test(
	'should rerender all children when collection was reset',
	function(assert) {
		var view = new CollectionView(this.options);
		view.render();

		this.collection.reset([
			{id: 50, title: 'omg'},
			{id: 60, title: 'wtf'}
		]);

		assert.equal($('.view > ul > li').length, 2);
		assert.equal($('.view > ul > li:first > div').attr('id'), 'item-50');
		assert.equal($('.view > ul > li:last > div').attr('id'), 'item-60');
	}
);
