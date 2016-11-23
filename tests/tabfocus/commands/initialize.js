/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/tabfocus/commands/Initialize';


QUnit.module('The tabfocus initialize command', {
	beforeEach: function() {
		this.context = new Geppetto.Context();

		this.context.wireCommand('test:initialize', Command);
	},

	afterEach: function() {
		$.each(this.context.getObject('tabfocus:views'), function() {
			this.destroy();
		});
	}
});

QUnit.test(
	'should create a view with "tabfocus" namespace',
	function(assert) {
		this.context.dispatch('test:initialize');

		var views = this.context.getObject('tabfocus:views');

		assert.equal(views.length, 1);
	}
);

QUnit.test(
	'should return default options',
	function(assert) {
		var
			classFocus = 'is-focused',
			selectorFocusable = 'a, button, [tabindex]',
			options
		;

		this.context.wireValue('tabfocus:settings', {
			classFocus: classFocus,
			selectorFocusable: selectorFocusable
		});

		this.context.dispatch('test:initialize');

		options = this.context.getObject('tabfocus:views')[0].options;

		assert.equal(options.classFocus, classFocus, 'classFocus is the same as default');
		assert.equal(options.selectorFocusable, selectorFocusable, 'selectorFocusable is the same as default');
	}
);

QUnit.test(
	'should change default options to custom',
	function(assert) {
		var
			classFocus = 'foobar',
			selectorFocusable = 'newselector',
			options
		;

		this.context.wireValue('tabfocus:settings', {
			classFocus: classFocus,
			selectorFocusable: selectorFocusable
		});

		this.context.dispatch('test:initialize');

		options = this.context.getObject('tabfocus:views')[0].options;

		assert.equal(options.classFocus, classFocus, 'classFocus has changed');
		assert.equal(options.selectorFocusable, selectorFocusable, 'selectorFocusable has changed');
	}
);
