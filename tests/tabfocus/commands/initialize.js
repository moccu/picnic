/* global QUnit */
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/tabfocus/commands/Initialize';


QUnit.module('The tabfocus initialize command', {
	beforeEach: function() {
		this.context = new Geppetto.Context();

		this.context.wireCommand('test:initialize', Command);
		this.context.dispatch('test:initialize');
	}
});

QUnit.test(
	'should create a view with "tabfocus" namespace',
	function(assert) {
		var views = this.context.getObject('tabfocus:views');

		assert.equal(views.length, 1);
	}
);
