/* global QUnit, sinon */
import Geppetto from 'backbone.geppetto';
import RegistryService from 'picnic/tracking-registry/services/Registry';


QUnit.module('The tracking-registry service', {
	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.service = new RegistryService({
			context: this.context
		});
	}
});

QUnit.test(
	'should throw an exception when instantiating without context',
	function(assert) {
		assert.throws(function() { new RegistryService(); });
	}
);

QUnit.test(
	'should register string mappings',
	function(assert) {
		var
			mapping = {foo: 'bar', baz: 'lol'},
			data = {foo: '123', baz: 'ABC'},
			callback = sinon.spy()
		;

		this.context.vent.on('tracking:trackevent', callback);
		this.service.register('tracking:trackevent', 'fake:event', mapping);

		//Test:
		this.context.dispatch('fake:event', data);
		assert.ok(callback.calledOnce);
		assert.deepEqual(
			callback.getCall(0).args[0],
			{foo: 'bar', baz: 'lol', eventName: 'tracking:trackevent'}
		);
	}
);

QUnit.test(
	'should register numeric mappings',
	function(assert) {
		var
			mapping = {foo: 1, baz: 2},
			data = {foo: '123', baz: 'ABC'},
			callback = sinon.spy()
		;

		this.context.vent.on('tracking:trackevent', callback);
		this.service.register('tracking:trackevent', 'fake:event', mapping);

		//Test:
		this.context.dispatch('fake:event', data);
		assert.ok(callback.calledOnce);
		assert.deepEqual(
			callback.getCall(0).args[0],
			{foo: 1, baz: 2, eventName: 'tracking:trackevent'}
		);
	}
);

QUnit.test(
	'should register objects\' property mappings',
	function(assert) {
		var
			mapping = {foo: '.bar', baz: '.lol'},
			data = {bar: '123', lol: 'ABC'},
			callback = sinon.spy()
		;

		this.context.vent.on('tracking:trackevent', callback);
		this.service.register('tracking:trackevent', 'fake:event', mapping);

		//Test:
		this.context.dispatch('fake:event', data);
		assert.ok(callback.calledOnce);
		assert.deepEqual(
			callback.getCall(0).args[0],
			{foo: '123', baz: 'ABC', eventName: 'tracking:trackevent'}
		);
	}
);

QUnit.test(
	'should register objects\' function mappings',
	function(assert) {
		var
			mapping = {foo: '.bar', baz: '.lol'},
			data = {bar: function() { return '123';}, lol: function() { return 'ABC';}},
			callback = sinon.spy()
		;

		this.context.vent.on('tracking:trackevent', callback);
		this.service.register('tracking:trackevent', 'fake:event', mapping);

		//Test:
		this.context.dispatch('fake:event', data);
		assert.ok(callback.calledOnce);
		assert.deepEqual(
			callback.getCall(0).args[0],
			{foo: '123', baz: 'ABC', eventName: 'tracking:trackevent'}
		);
	}
);

QUnit.test(
	'should register function references for mappings',
	function(assert) {
		var
			func = function(eventData) { return eventData.lol(); },
			mapping = {foo: '.bar', baz: func},
			data = {bar: function() { return '123';}, lol: function() { return 'ABC';}},
			callback = sinon.spy()
		;

		this.context.vent.on('tracking:trackevent', callback);
		this.service.register('tracking:trackevent', 'fake:event', mapping);

		//Test:
		this.context.dispatch('fake:event', data);
		assert.ok(callback.calledOnce);
		assert.deepEqual(
			callback.getCall(0).args[0],
			{foo: '123', baz: 'ABC', eventName: 'tracking:trackevent'}
		);
	}
);

QUnit.test(
	'should register for an event twice',
	function(assert) {
		var	callback = sinon.spy();

		this.context.vent.on('tracking:trackevent', callback);
		this.service.register('tracking:trackevent', 'fake:event', {foo: 'bar'});
		this.service.register('tracking:trackevent', 'fake:event', {bar: 'baz'});

		//Test:
		this.context.dispatch('fake:event');
		assert.deepEqual(
			callback.getCall(0).args[0],
			{foo: 'bar', eventName: 'tracking:trackevent'}
		);
		assert.deepEqual(
			callback.getCall(1).args[0],
			{bar: 'baz', eventName: 'tracking:trackevent'}
		);
	}
);

QUnit.test(
	'should not register for an event without mapping',
	function(assert) {
		assert.throws(function() {
			this.service.register('tracking:trackevent', 'fake:event');
		});
	}
);

QUnit.test(
	'should not register for an event with incorrect mapping types',
	function(assert) {
		// String:
		assert.throws(function() {
			this.service.register('tracking:trackevent', 'fake:event', 'hello');
		});

		// Integer:
		assert.throws(function() {
			this.service.register('tracking:trackevent', 'fake:event', 1);
		});

		// Null:
		assert.throws(function() {
			this.service.register('tracking:trackevent', 'fake:event', null);
		});

		// Undefined:
		assert.throws(function() {
			this.service.register('tracking:trackevent', 'fake:event', undefined);
		});

		// Boolean:
		assert.throws(function() {
			this.service.register('tracking:trackevent', 'fake:event', true);
		});
		assert.throws(function() {
			this.service.register('tracking:trackevent', 'fake:event', false);
		});
	}
);
