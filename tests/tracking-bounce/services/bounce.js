/* global QUnit, sinon */
import Geppetto from 'backbone.geppetto';
import Service from 'picnic/tracking-bounce/services/Bounce';


QUnit.module('The tracking-bounce service', {
	beforeEach: function() {
		var self = this;
		this.context = new Geppetto.Context();
		this.tick = 1000;
		this.end = 3000;
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
				getEnd: function() {
					return (new Date()).getTime() + self.end;
				}
			});
		};
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
	'should fail on instantiation when incorrect getEnd option in given',
	function(assert) {
		var self = this;
		assert.throws(function() {
			new Service({
				context: self.context,
				getEnd: 'tomorrow'
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				getEnd: (new Date()).getTime() + 1000
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				getEnd: true
			});
		});
	}
);

QUnit.test(
	'should fail on instantiation when incorrect tick option in given',
	function(assert) {
		var self = this;
		assert.throws(function() {
			new Service({
				context: self.context,
				tick: '1 second'
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				tick: true
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				tick: 0
			});
		});

		assert.throws(function() {
			new Service({
				context: self.context,
				tick: -100
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
		this.sandbox.clock.tick(this.tick);
		assert.ok(callback.calledOnce);

		// Tick 2
		this.sandbox.clock.tick(this.tick);
		assert.ok(callback.calledTwice);

		// Tick 3
		this.sandbox.clock.tick(this.tick);
		assert.ok(callback.calledThrice);

		// No new tick event, end is reached
		this.sandbox.clock.tick(this.tick);
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
		this.sandbox.clock.tick(this.tick);
		assert.ok(callback.calledOnce);

		// Reset:
		this.service.reset();

		// Tick 2
		this.sandbox.clock.tick(this.tick);
		assert.ok(callback.calledOnce);

		// Start:
		this.service.start();

		// Tick 1
		this.sandbox.clock.tick(this.tick);
		assert.ok(callback.calledTwice);

		// Tick 2
		this.sandbox.clock.tick(this.tick);
		assert.ok(callback.calledThrice);

		// Tick 3
		this.sandbox.clock.tick(this.tick);
		assert.equal(callback.callCount, 4);

		// No new tick event, end is reached
		this.sandbox.clock.tick(this.tick);
		assert.equal(callback.callCount, 4);
	}
);
