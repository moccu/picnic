/* global QUnit, sinon */
import $ from 'jquery';
import Backbone from 'backbone';
import Geppetto from 'backbone.geppetto';
import BaseView from 'picnic/core/views/Base';
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
		$('.overlay').remove();
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
	'should create an instance of class which inherits from Backbone.View when given as content',
	function(assert) {
		var
			instance,
			overlay
		;

		function setInstance(i) {
			instance = i;
		}

		class View extends Backbone.View {
			constructor(options) {
				super(options);
				this.options = options;
				setInstance(this);
			}
		}

		this.context.dispatch('overlay:open', {content: View});
		overlay = this.context.getObject('overlay:view');

		assert.ok(instance instanceof View);
		assert.ok(instance instanceof Backbone.View);
		assert.equal(instance.options.context, this.context);
		assert.equal(instance.options.overlay, overlay);
	}
);

QUnit.test(
	'should create an instance of class which inherits from BaseView when given as content',
	function(assert) {
		var
			instance,
			overlay
		;

		function setInstance(i) {
			instance = i;
		}

		class View extends BaseView {
			constructor(options) {
				super(options);
				this.options = options;
				setInstance(this);
			}
		}

		this.context.dispatch('overlay:open', {content: View});
		overlay = this.context.getObject('overlay:view');

		assert.ok(instance instanceof View);
		assert.ok(instance instanceof BaseView);
		assert.ok(instance instanceof Backbone.View);
		assert.equal(instance.options.context, this.context);
		assert.equal(instance.options.overlay, overlay);
	}
);

QUnit.test(
	'should fail when given class as content not inherits from Backbone.View',
	function(assert) {
		class View {}

		assert.throws(function() {
			this.context.dispatch('overlay:open', {content: View});
		});
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
