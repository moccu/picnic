/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/clickblocker/commands/Close';
import View from 'picnic/clickblocker/views/Clickblocker';


QUnit.module('The clickblocker close command', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
		this.view = new View({context: this.context, key: 'foobar', el: this.root});
		this.view.render();
		this.view.open();
		this.context.wireCommand('clickblocker:close', Command);
		this.context.wireValue('clickblocker:view', this.view);
	}

});

QUnit.test(
	'should destroy view when close command is triggered',
	function(assert) {
		this.view.destroy = sinon.spy();
		this.context.dispatch('clickblocker:close', {key: 'foobar'});

		assert.ok(this.view.destroy.calledOnce);
	}
);

QUnit.test(
	'should not destroy view when close command is triggered with wrong key',
	function(assert) {
		this.view.destroy = sinon.spy();
		this.context.dispatch('clickblocker:close', {key: 'bar'});

		assert.equal(this.view.destroy.callCount, 0);
	}
);

QUnit.test(
	'should release wiring',
	function(assert) {
		this.context.dispatch('clickblocker:close', {key: 'foobar'});
		assert.ok(!this.context.hasWiring('clickblocker:view'));
	}
);

QUnit.test(
	'should not fail when called twice or more',
	function(assert) {
		this.view.destroy = sinon.spy();
		this.context.dispatch('clickblocker:close', {key: 'foobar'});
		assert.ok(this.view.destroy.calledOnce);

		this.context.dispatch('clickblocker:close', {key: 'foobar'});
		this.context.dispatch('clickblocker:close', {key: 'foobar'});
		assert.ok(this.view.destroy.calledOnce);
	}
);
