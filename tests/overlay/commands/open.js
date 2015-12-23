/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/overlay/commands/Open';
import View from 'picnic/overlay/views/Overlay';


QUnit.module('The overlay open command', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
		this.context.wireCommand('overlay:open', Command);
	},

	afterEach: function() {
		this.context.getObject('overlay:view').destroy();
	}

});

QUnit.test(
	'should create view when called',
	function(assert) {
		this.context.dispatch('overlay:open', {
			content: '<p>foo bar</p>'
		});

		assert.ok(this.context.getObject('overlay:view') instanceof View);
	}
);

QUnit.test(
	'should change content when overlay already exsits',
	function(assert) {
		this.context.dispatch('overlay:open', {
			content: '<p>foo bar</p>'
		});

		var
			oldView = this.context.getObject('overlay:view'),
			newView
		;

		this.context.dispatch('overlay:open', {
			content: '<p>foo bar baz</p>'
		});

		newView = this.context.getObject('overlay:view');

		assert.equal(newView, oldView, 'The view was re-instantiated');
		assert.equal(newView.getContent().text(), 'foo bar baz');
	}
);

QUnit.test(
	'should set reference',
	function(assert) {
		var reference = this.root;

		this.context.dispatch('overlay:open', {
			content: '<p>foo bar</p>',
			reference: reference
		});

		assert.equal(this.context.getObject('overlay:view').reference, reference);
	}
);

QUnit.test(
	'should set className',
	function(assert) {
		this.context.dispatch('overlay:open', {
			content: '<p>foo bar</p>',
			className: 'foobar'
		});

		assert.ok(this.context.getObject('overlay:view').getContainer().hasClass('foobar'));
	}
);

QUnit.test(
	'should use clickblocker when requested',
	function(assert) {
		var callback = sinon.spy();

		this.context.vent.on('clickblocker:open', callback);

		this.context.dispatch('overlay:open', {
			content: '<p>foo bar</p>',
			clickblocker: true
		});

		assert.ok(this.context.getObject('overlay:view').hasClickblocker);
		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0].key, 'overlay');
	}
);
