/* global QUnit, sinon */
import Geppetto from 'backbone.geppetto';
import Service from 'picnic/tracking-bounce/services/Bounce';


QUnit.module('The tracking-bounce service', {
	beforeEach: function() {
		var self = this;
		this.context = new Geppetto.Context();
		this.clock = sinon.useFakeTimers();
		this.tick = 1000;
		this.eventName = 'foo:bar';
		this.eventData = {
			foo: 'foo',
			bar: 'bar'
		},
		this.create = function(autostart) {

			if (autostart === undefined) {
				autostart = true;
			}

			this.service = new Service({
				autostart: autostart,
				context: self.context,
				eventName: self.eventName,
				eventData: self.eventData,
				tick: 1000,
				end: 3000
			});
		};
	},

	afterEach: function() {
		this.clock.restore();
	}
});

QUnit.test(
	'should fail on instantiation when no context is given',
	function(assert) {
		assert.throws(function() {
			new Service();
		});
	}
);

QUnit.test(
	'should fail on instantiation when incorrect end option is given',
	function(assert) {
		var self = this;
		assert.throws(function() {
			new Service({
				context: self.context,
				end: 'tomorrow',
				tick: 1000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				end: true,
				tick: 1000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				end: function() {},
				tick: 1000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				end: 0,
				tick: 1000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				end: -1000,
				tick: 1000
			});
		});
	}
);

QUnit.test(
	'should fail on instantiation when incorrect tick option is given',
	function(assert) {
		var self = this;
		assert.throws(function() {
			new Service({
				context: self.context,
				tick: '1 second',
				end: 3000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				tick: true,
				end: 3000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				tick: 0,
				end: 3000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				tick: -100,
				end: 3000
			});
		});
	}
);

QUnit.test(
	'should initialize correctly when all options are given',
	function(assert) {
		this.create();
		assert.ok(true);
	}
);

QUnit.test(
	'should trigger tick events and end at given end time',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on(this.eventName, callback);
		this.create();

		// Tick 1
		this.clock.tick(this.tick);
		assert.ok(callback.calledOnce);

		// Tick 2
		this.clock.tick(this.tick);
		assert.ok(callback.calledTwice);

		// Tick 3
		this.clock.tick(this.tick);
		assert.ok(callback.calledThrice);

		// No new tick event, end is reached
		this.clock.tick(this.tick);
		assert.ok(callback.calledThrice);

		// Validate eventData:
		assert.deepEqual(callback.getCall(0).args[0], this.eventData);
		assert.deepEqual(callback.getCall(1).args[0], this.eventData);
		assert.deepEqual(callback.getCall(2).args[0], this.eventData);
	}
);

QUnit.test(
	'should trigger reset and start bounce service',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on(this.eventName, callback);
		this.create();

		// Tick 1
		this.clock.tick(this.tick);
		assert.ok(callback.calledOnce);

		// Reset:
		this.service.reset();

		// Tick 2
		this.clock.tick(this.tick);
		assert.ok(callback.calledOnce);

		// Start:
		this.service.start();

		// Tick 1
		this.clock.tick(this.tick);
		assert.ok(callback.calledTwice);

		// Tick 2
		this.clock.tick(this.tick);
		assert.ok(callback.calledThrice);

		// Tick 3
		this.clock.tick(this.tick);
		assert.equal(callback.callCount, 4);

		// No new tick event, end is reached
		this.clock.tick(this.tick);
		assert.equal(callback.callCount, 4);
	}
);
