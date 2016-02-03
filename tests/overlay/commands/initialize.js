/* global QUnit */
import Geppetto from 'backbone.geppetto';
import Initialize from 'picnic/overlay/commands/Initialize';


QUnit.module('The overlay initialize command', {

	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:initialize', Initialize);
	},

	afterEach: function() {
		Initialize.resetCount();
	}

});

QUnit.test(
	'should wire open command',
	function(assert) {
		this.context.dispatch('test:initialize');

		// Geppetto did not set any instances dictionary or list to wired
		// commands but an anonymous function which creates and calls the given
		// command. So we can only test if there is a event listener for the
		// specified event:
		assert.ok(typeof this.context.vent._events['overlay:open'][0].callback === 'function');
		assert.ok(this.context.vent._events['overlay:open'].length, 1);
	}
);

QUnit.test(
	'should wire close command',
	function(assert) {
		this.context.dispatch('test:initialize');

		// Geppetto did not set any instances dictionary or list to wired
		// commands but an anonymous function which creates and calls the given
		// command. So we can only test if there is a event listener for the
		// specified event:
		assert.ok(typeof this.context.vent._events['overlay:close'][0].callback === 'function');
		assert.ok(this.context.vent._events['overlay:close'].length, 1);
	}
);

QUnit.test(
	'should wire commands only once',
	function(assert) {
		this.context.dispatch('test:initialize');
		this.context.dispatch('test:initialize');

		// Geppetto did not set any instances dictionary or list to wired
		// commands but an anonymous function which creates and calls the given
		// command. So we can only test if there is a event listener for the
		// specified event:
		assert.ok(this.context.vent._events['overlay:open'].length, 1);
		assert.ok(this.context.vent._events['overlay:close'].length, 1);
		assert.ok(Initialize.called);
		assert.equal(Initialize.callcount, 2);
	}
);

QUnit.test(
	'should have possebility to reset callcount',
	function(assert) {
		this.context.dispatch('test:initialize');
		this.context.dispatch('test:initialize');

		assert.equal(Initialize.callcount, 2);
		Initialize.resetCount();
		assert.equal(Initialize.callcount, 0);
	}
);
