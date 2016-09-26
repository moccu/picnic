/* global QUnit */
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Geppetto from 'backbone.geppetto';
import TemplateView from 'picnic/core/views/Template';
import BaseView from 'picnic/core/views/Base';
import Fixure from 'tests/core/views/fixtures/template.html!text';


var
	Template = '<div>Model is <%- model %>, Collection is <%- collection %></div>'
;


class View extends TemplateView {
	get template() {
		return Template;
	}
}

QUnit.module('The core tempalte view', {
	beforeEach: function() {
		$(Fixure).appendTo($('#qunit-fixture'));
		this.context = new Geppetto.Context();
		this.options = {
			el: $('.view')[0],
			context: this.context
		};
	}
});

QUnit.test(
	'should expose the expected constants from the view class',
	function(assert) {
		var expected = [
			{key: 'STRATEGY_APPEND', value: 'appendTo'},
			{key: 'STRATEGY_BEFORE', value: 'insertBefore'},
			{key: 'STRATEGY_AFTER', value: 'insertAfter'}
		];

		_.each(expected, prop => {
			assert.equal(TemplateView[prop.key], prop.value);
		});

		assert.equal(Object.keys(TemplateView).length, expected.length);
	}
);

QUnit.test(
	'should fail on instantiation when the "template" getter is not overwritten in inheriting view',
	function(assert) {
		var options = this.options;

		assert.throws(function() {
			new TemplateView(options);
		}, new Error('Define a template by overwrite the "get template()" property of the TemplateView.'));
	}
);

QUnit.test(
	'should inherit from base view',
	function(assert) {
		assert.ok(new View(this.options) instanceof BaseView);
	}
);

QUnit.test(
	'should pass "null" into template context when model and collection is not set',
	function(assert) {
		var
			view = new View(this.options),
			template = _.template(Template),
			expected = template({
				model: null,
				collection: null
			})
		;

		view.render();
		assert.equal(view.content[0].outerHTML, expected);
	}
);

QUnit.test(
	'should pass backbone model attributes into template context',
	function(assert) {
		var
			model = new Backbone.Model({id: 1, name: 'foo'}),
			view = new View($.extend({model: model}, this.options)),
			template = _.template(Template),
			expected = template({
				model: model.toJSON(),
				collection: null
			})
		;

		view.render();
		assert.equal(view.content[0].outerHTML, expected);
	}
);

QUnit.test(
	'should pass backbone collection items into template context',
	function(assert) {
		var
			collection = new Backbone.Collection([
				{id: 1, name: 'foo'},
				{id: 2, name: 'bar'}
			]),
			view = new View($.extend({collection: collection}, this.options)),
			template = _.template(Template),
			expected = template({
				model: null,
				collection: collection.toJSON()
			})
		;

		view.render();
		assert.equal(view.content[0].outerHTML, expected);
	}
);

QUnit.test(
	'should pass object or value into template context when model is no backbone model',
	function(assert) {
		var
			view = new View($.extend({model: 'no-backbone-model'}, this.options)),
			template = _.template(Template),
			expected = template({
				model: 'no-backbone-model',
				collection: null
			})
		;

		view.render();
		assert.equal(view.content[0].outerHTML, expected);
	}
);

QUnit.test(
	'should pass object or value into template context when collection is no backbone collection',
	function(assert) {
		var
			view = new View($.extend({collection: 'no-backbone-collection'}, this.options)),
			template = _.template(Template),
			expected = template({
				model: null,
				collection: 'no-backbone-collection'
			})
		;

		view.render();
		assert.equal(view.content[0].outerHTML, expected);
	}
);

QUnit.test(
	'should use return value from "data" getter as template context',
	function(assert) {
		class TempView extends TemplateView {

			get template() {
				return '<div><%- foo %></div>';
			}

			get data() {
				return {foo: 'bar'};
			}

		}

		var view = new TempView(this.options);
		view.render();
		assert.equal(view.content[0].outerHTML, '<div>bar</div>');
	}
);

QUnit.test(
	'should append content by default to view.$el using default strategy',
	function(assert) {
		var view = new View(this.options);
		view.render();

		assert.equal(view.content[0], $('.view > div').last()[0]);
	}
);

QUnit.test(
	'should use the "target" getter to define where to add the content',
	function(assert) {
		class TempView extends View {

			get target() {
				return this.$el.find(' > div');
			}

		}

		var view = new TempView(this.options);
		view.render();

		assert.equal(view.content[0], $('.view > div > div')[0]);
	}
);


QUnit.test(
	'should take care of "strategy" getter when render content',
	function(assert) {
		class TempView extends View {

			get strategy() {
				return TemplateView.STRATEGY_BEFORE;
			}

		}

		var view = new TempView(this.options);
		view.render();

		assert.equal(view.content[0], $('.view').prev()[0]);
	}
);
