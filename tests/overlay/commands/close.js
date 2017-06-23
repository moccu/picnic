/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/overlay/commands/Close';
import View from 'picnic/overlay/views/Overlay';


QUnit.module('The overlay close command', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
		this.view = new View({context: this.context, content: '<p>foo bar</p>', target: this.root});
		this.view.render();
		this.context.wireCommand('overlay:close', Command);
		this.context.wireValue('overlay:view', this.view);
	}

});

QUnit.test(
	'should destroy view when close command is triggered',
	function(assert) {
		this.view.destroy = sinon.spy();
		this.context.dispatch('overlay:close');

		assert.ok(this.view.destroy.calledOnce);
	}
);

QUnit.test(
	'should release wiring',
	function(assert) {
		this.context.dispatch('overlay:close');
		assert.ok(!this.context.hasWiring('overlay:view'));
	}
);

QUnit.test(
	'should not fail when called twice or more',
	function(assert) {
		this.view.destroy = sinon.spy();
		this.context.dispatch('overlay:close');
		assert.ok(this.view.destroy.calledOnce);

		this.context.dispatch('overlay:close');
		this.context.dispatch('overlay:close');
		assert.ok(this.view.destroy.calledOnce);
	}
);

QUnit.test(
	'should close clickblocker when requested',
	function(assert) {

		var callback = sinon.spy();
		this.context.vent.on('clickblocker:close', callback);

		this.view.hasClickblocker = true;
		this.context.dispatch('overlay:close');

		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0].key, 'overlay');
	}
);

QUnit.test(
	'should restore previously focused element',
	function(assert) {
		var active = document.createElement('button');
		this.root.append(active);

		this.context.wireValue('overlay:activeelement', active);
		this.context.dispatch('overlay:close');

		assert.equal(document.activeElement, active);
		assert.notOk(this.context.hasWiring('overlay:activeelement'));
	}
);
