/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/clickblocker/commands/Open';
import View from 'picnic/clickblocker/views/Clickblocker';


QUnit.module('The clickblocker open command', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
		this.context.wireCommand('clickblocker:open', Command);
	},

	afterEach: function() {
		this.context.getObject('clickblocker:view').destroy();
	}

});

QUnit.test(
	'should create view when called',
	function(assert) {
		this.context.dispatch('clickblocker:open', {
			key: 'foobar'
		});

		assert.ok(this.context.getObject('clickblocker:view') instanceof View);
		assert.equal(this.context.getObject('clickblocker:view').getKey(), 'foobar');
	}
);

QUnit.test(
	'should not create other views when an other exisits',
	function(assert) {
		this.context.dispatch('clickblocker:open', {
			key: 'foobar'
		});

		var view = this.context.getObject('clickblocker:view');

		this.context.dispatch('clickblocker:open', {
			key: 'baz'
		});

		assert.equal(this.context.getObject('clickblocker:view'), view);
		assert.equal(this.context.getObject('clickblocker:view').getKey(), 'foobar');
		assert.equal(view.getKey(), 'foobar');
	}
);
