/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/singlepage/commands/Initialize';
import View from 'picnic/singlepage/views/Singlepage';
import Service from 'picnic/singlepage/services/History';
import Fixture from 'tests/singlepage/commands/fixtures/initialize.html!text';

QUnit.module('The singlepage initialize command', {
	beforeEach: function() {
		window.zdfevent = {
			singlepage: {
				forceNewWindow: false
			}
		};

		var element = $('#qunit-fixture');
		$(Fixture).appendTo(element);

		this.context = new Geppetto.Context();
		this.context.wireCommand('test:initialize', Command);
	},

	afterEach: function() {
		window.zdfevent = undefined;
		delete(window.zdfevent);

		$('body').off('click');
	}
});

QUnit.test(
	'should create an array of views in "singlepage" namespace',
	function(assert) {
		this.context.dispatch('test:initialize');

		var views = this.context.getObject('singlepage:views');
		assert.equal(views.length, 1);
	}
);

QUnit.test(
	'should create views of correct type',
	function(assert) {
		this.context.dispatch('test:initialize');

		var views = this.context.getObject('singlepage:views');
		assert.ok(views[0] instanceof View);
	}
);

QUnit.test(
	'should pass expected settings into view',
	function(assert) {
		this.context.dispatch('test:initialize');

		var view = this.context.getObject('singlepage:views')[0];
		assert.equal(view.el, document.body);
		assert.equal(view.context, this.context);
		assert.equal(view.options.observeSelector, 'a:not(.no-singlepage)');
		assert.equal(view.options.updateSelector, '#main');
		assert.equal(view.options.eventName, 'singlepage:navigate');
	}
);

QUnit.test(
	'should wire command for handling a request of a result',
	function(assert) {
		this.context.dispatch('test:initialize');

		// Geppetto did not set any instances dictionary or list to wired
		// commands but an anonymous function which creates and calls the given
		// command. So we can only test if there is a event listener for the
		// specified event:
		assert.equal(this.context.vent._events['singlepage:navigate'].length, 1);
		assert.ok(typeof this.context.vent._events['singlepage:navigate'][0].callback === 'function');
	}
);

QUnit.test(
	'should wire history service',
	function(assert) {
		this.context.dispatch('test:initialize');

		assert.ok(this.context.hasWiring('singlepage:service'));
		assert.ok(this.context.getObject('singlepage:service') instanceof Service);
		assert.equal(this.context.getObject('singlepage:service')._eventName, 'singlepage:navigate');
	}
);

QUnit.test(
	'should only wire events and service once',
	function(assert) {
		// Once...
		this.context.dispatch('test:initialize');

		var service = this.context.getObject('singlepage:service');
		// Twice...
		this.context.dispatch('test:initialize');

		// Geppetto did not set any instances dictionary or list to wired
		// commands but an anonymous function which creates and calls the given
		// command. So we can only test if there is a event listener for the
		// specified event:
		assert.equal(this.context.vent._events['singlepage:navigate'].length, 1);
		assert.ok(typeof this.context.vent._events['singlepage:navigate'][0].callback === 'function');
		assert.equal(this.context.getObject('singlepage:service'), service);
	}
);

QUnit.test(
	'should only wire view, service and events when the browers not supports History API',
	function(assert) {

		var orgIsSupported = Service.isSupported;
		Service.isSupported = function() {
			return false;
		};

		this.context.dispatch('test:initialize');
		assert.notOk(this.context.hasWiring('singlepage:views'));
		assert.notOk(this.context.hasWiring('singlepage:service'));
		assert.equal(this.context.vent._events['singlepage:navigate'], undefined);

		Service.isSupported = orgIsSupported;
	}
);
