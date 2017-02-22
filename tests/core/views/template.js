/* global QUnit, sinon */
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
			{key: 'INSERT_APPENDTO', value: 'appendTo'},
			{key: 'INSERT_BEFORE', value: 'insertBefore'},
			{key: 'INSERT_AFTER', value: 'insertAfter'}
		];

		_.each(expected, prop => {
			assert.equal(TemplateView[prop.key], prop.value);
		});

		assert.equal(Object.keys(TemplateView).length, expected.length);
	}
);

QUnit.test(
	'should fail on instantiation when the "template" option wasn\'t set',
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
	'should return itself on render() call',
	function(assert) {
		var view = new View(this.options);
		assert.equal(view.render(), view);
	}
);

QUnit.test(
	'should overwrite insertMethod when given in constructor options',
	function(assert) {
		var view = new View($.extend({insertMethod: 'foo'}, this.options));
		assert.equal(view.insertMethod, 'foo');
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
	'should append content by default to view.$el using default insertMethod',
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
	'should have expected default insertMethod',
	function(assert) {
		var view = new View(this.options);
		assert.equal(view.insertMethod, TemplateView.INSERT_APPENDTO);
	}
);

QUnit.test(
	'should take care of "insertMethod" getter when render content',
	function(assert) {
		class TempView extends View {

			get insertMethod() {
				return TemplateView.INSERT_BEFORE;
			}

		}

		var view = new TempView(this.options);
		view.render();

		assert.equal(view.content[0], $('.view').prev()[0]);
	}
);

QUnit.test(
	'should re-render content',
	function(assert) {
		var
			data = {name: 'foo'},
			view,
			content
		;

		class TempView extends View {

			get template() {
				return '<div><%- name %></div>';
			}

			get data() {
				return data;
			}

		}

		view = new TempView(this.options);
		view.render();
		content = view.content[0];

		data.name = 'bar';
		view.render();

		assert.notEqual(view.content[0], content);
		assert.notEqual(view.content[0].innerHTML, content.innerHTML);
		assert.equal(view.content[0].innerHTML, data.name);
	}
);

QUnit.test('should delegate and undelegate events when re-render content', function(assert) {
	class TempView extends View {

		get events() {
			return {
				'click': '_onClick',
			};
		}

		get template() {
			return	'<div></div>';
		}

	}

	var view = new TempView(this.options);
	sinon.stub(view, 'delegateEvents');
	sinon.stub(view, 'undelegateEvents');

	view.render();
	assert.ok(view.undelegateEvents.calledOnce);
	assert.ok(view.delegateEvents.calledOnce);

	view.render();
	assert.ok(view.undelegateEvents.calledTwice);
	assert.ok(view.delegateEvents.calledTwice);
});

QUnit.test('should not fail on destroy when not rendered before', function(assert) {
	var view = new View(this.options);
	view.destroy();

	assert.ok(true, 'Nothing unexpected happend');
});

QUnit.test('should not fail when accedentially destroying more than onece', function(assert) {
	var view = new View(this.options);
	view.render();
	view.destroy();
	view.destroy();

	assert.ok(true, 'Nothing unexpected happend');
});
