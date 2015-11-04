/* global QUnit */
import Geppetto from 'backbone.geppetto';
import InitializeCommand from 'picnic/clickblocker/commands/Initialize';


QUnit.module('The clickblocker initialize command', {

	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:initialize', InitializeCommand);
		this.context.dispatch('test:initialize');
	}

});

QUnit.test(
	'should wire open command',
	function(assert) {
		// Geppetto did not set any instances dictionary or list to wired
		// commands but an anonymous function which creates and calls the given
		// command. So we can only test if there is a event listener for the
		// specified event:
		assert.ok(typeof this.context.vent._events['clickblocker:open'][0].callback === 'function');
		assert.ok(this.context.vent._events['clickblocker:open'].length, 1);
	}
);

QUnit.test(
	'should wire close command',
	function(assert) {
		// Geppetto did not set any instances dictionary or list to wired
		// commands but an anonymous function which creates and calls the given
		// command. So we can only test if there is a event listener for the
		// specified event:
		assert.ok(typeof this.context.vent._events['clickblocker:close'][0].callback === 'function');
		assert.ok(this.context.vent._events['clickblocker:close'].length, 1);
	}
);
