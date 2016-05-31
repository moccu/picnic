/* global QUnit */
import _ from 'underscore';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/tabfocus/commands/Initialize';


QUnit.module('The tabfocus initialize command', {
	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:event', Command);
	}
})

QUnit.test(
	'should create one view with "tabfocus" namespace',
	function(assert) {
		this.context.dispatch('test:event');
		var views = this.context.getObject('tabfocus:views');
		assert.equal(views.length, 1);
	}
);
