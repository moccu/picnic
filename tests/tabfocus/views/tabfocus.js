/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Tabfocus from 'picnic/tabfocus/views/Tabfocus';
import Fixure from 'tests/tabfocus/views/fixtures/tabfocus.html!text';


var
	CLASS_FOCUS = 'is-focused',
	KEYUP = 'keyup'
;

QUnit.module('The tabfocus view', {
	beforeEach: function() {
		var root = $('#qunit-fixture');
		$(Fixure).appendTo(root);

		this.root = root;
		this.context = new Geppetto.Context();
		this.view = new Tabfocus({
			el: this.root,
			context: this.context
		});
	},

	afterEach: function() {
		this.view.destroy();
	}
});

QUnit.test(
	'should render itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);

QUnit.test(
	'should focus default focusable elements on tab',
	function(assert) {
		this.view = new Tabfocus({
			el: this.root,
			context: this.context,
			selector: 'body'
		}).render();

		this.view.$el.find('a').eq(1).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('a').eq(1).hasClass(CLASS_FOCUS));

		this.view.$el.find('a').eq(2).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('a').eq(2).hasClass(CLASS_FOCUS));

		this.view.$el.find('a').eq(3).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('a').eq(3).hasClass(CLASS_FOCUS));

		this.view.$el.find('button').focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('button').hasClass(CLASS_FOCUS));

		this.view.$el.find('div').eq(1).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('div').eq(1).hasClass(CLASS_FOCUS));
	}
);

QUnit.test(
	'should change focus class',
	function(assert) {
		var
			NEWCLASS = 'foobar'
		;

		this.view = new Tabfocus({
			el: this.root,
			context: this.context,
			classFocus: NEWCLASS
		}).render();


		this.view.$el.find('a').eq(3).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('a').eq(3).hasClass(NEWCLASS));

		this.view.$el.find('a').eq(1).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('a').eq(1).hasClass(NEWCLASS));

		this.view.$el.find('div').eq(1).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('div').eq(1).hasClass(NEWCLASS));
	}
);

QUnit.test(
	'should change focusable selector',
	function(assert) {
		this.view = new Tabfocus({
			el: this.root,
			context: this.context,
			selectorFocusable: 'input'
		}).render();

		this.view.$el.find('input').eq(0).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('input').eq(0).hasClass(CLASS_FOCUS));

		this.view.$el.find('input').eq(1).focus().trigger(KEYUP);
		assert.ok(this.view.$el.find('input').eq(1).hasClass(CLASS_FOCUS));

		this.view.$el.find('a').eq(3).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('a').eq(3).hasClass(CLASS_FOCUS));
	}
);

QUnit.test(
	'should not focus on click',
	function(assert) {
		this.view.render();

		this.view.$el.find('a').eq(1).focus().trigger('mosueup');
		assert.notOk(this.view.$el.find('a').eq(1).hasClass(CLASS_FOCUS));

		this.view.$el.find('a').eq(2).focus().trigger('mosueup');
		assert.notOk(this.view.$el.find('a').eq(2).hasClass(CLASS_FOCUS));

		this.view.$el.find('a').eq(3).focus().trigger('mosueup');
		assert.notOk(this.view.$el.find('a').eq(3).hasClass(CLASS_FOCUS));

		this.view.$el.find('button').focus().trigger('mosueup');
		assert.notOk(this.view.$el.find('button').hasClass(CLASS_FOCUS));

		this.view.$el.find('div').eq(1).focus().trigger('mosueup');
		assert.notOk(this.view.$el.find('div').eq(1).hasClass(CLASS_FOCUS));

		this.view.$el.find('input').focus().trigger('mosueup');
		assert.notOk(this.view.$el.find('button').hasClass(CLASS_FOCUS));
	}
);

QUnit.test(
	'should not focus elements different than "a, button, [tabindex]" initial',
	function(assert) {
		this.view.render();

		this.view.$el.find('input').eq(0).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('input').eq(0).hasClass(CLASS_FOCUS));

		this.view.$el.find('input').eq(1).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('input').eq(1).hasClass(CLASS_FOCUS));

		this.view.$el.find('div').eq(0).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('div').eq(0).hasClass(CLASS_FOCUS));

		this.view.$el.find('div').eq(2).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('div').eq(2).hasClass(CLASS_FOCUS));

		this.view.$el.find('select').eq(0).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('select').eq(0).hasClass(CLASS_FOCUS));

		this.view.$el.find('input').eq(0).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('input').eq(0).hasClass(CLASS_FOCUS));
	}
);

QUnit.test(
	'should not focus disabled button',
	function(assert) {
		this.view.render();

		this.view.$el.find('.disable').eq(0).focus().trigger(KEYUP);
		assert.notOk(this.view.$el.find('.disable').eq(0).hasClass(CLASS_FOCUS));
	}
);

QUnit.test(
	'should unbind events on destroy',
	function(assert) {
		this.view.render();
		this.view.destroy();
		assert.notOk($._data($('#qunit-fixture')[0], 'events'));
	}
);
