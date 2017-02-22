/* global QUnit */
import $ from 'jquery';
import Backbone from 'backbone';
import Geppetto from 'backbone.geppetto';
import View from 'picnic/core/views/Base';
import Fixure from 'tests/core/views/fixtures/base.html!text';


QUnit.module('The core base view', {
	beforeEach: function() {
		$(Fixure).appendTo($('#qunit-fixture'));
		this.context = new Geppetto.Context();
	}
});

QUnit.test(
	'should fail on instantiation when no context is given',
	function(assert) {
		assert.throws(function() {
			new View({
				el: $('.test')
			});
		}, new Error('Supply the correct context instance.'));
	}
);

QUnit.test(
	'should instantiate correctly when context is given',
	function(assert) {
		new View({
			el: $('.test'),
			context: this.context
		});

		assert.ok(true, 'Everything worked fine');
	}
);

QUnit.test(
	'should store context as property on view instance',
	function(assert) {
		var view = new View({
			el: $('.test'),
			context: this.context
		});

		assert.equal(view.context, this.context);
	}
);

QUnit.test(
	'should store options as property on view instance',
	function(assert) {
		var
			options = {
				el: $('.test'),
				context: this.context
			},
			view = new View(options)
		;

		assert.equal(view.options, options);
	}
);

QUnit.test(
	'should be an instance of Backbone.View',
	function(assert) {
		var
			view = new View({
				el: $('.test'),
				context: this.context
			})
		;

		assert.ok(view instanceof Backbone.View);
	}
);

QUnit.test(
	'should remove references to options and context when destroyed',
	function(assert) {
		var
			view = new View({
				el: $('.test'),
				context: this.context
			})
		;

		view.destroy();
		assert.notOk(view.hasOwnProperty('context'));
		assert.notOk(view.hasOwnProperty('options'));
	}
);

QUnit.test('should not fail on destroy when not rendered before', function(assert) {
	var view = new View({el: $('.test'), context: this.context});
	view.destroy();

	assert.ok(true, 'Nothing unexpected happend');
});

QUnit.test('should not fail when accedentially destroying more than onece', function(assert) {
	var view = new View({el: $('.test'), context: this.context});
	view.render();
	view.destroy();
	view.destroy();

	assert.ok(true, 'Nothing unexpected happend');
});
