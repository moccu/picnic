/* global QUnit, sinon */
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/tracking-analytics/commands/TrackEvent';


QUnit.module('The tracking-analytics trackevent command', {
	beforeEach: function() {
		// Create objects and wireings
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:run', Command);

		// Mock Google Analytics:
		this.gaCalls = [];
		window.ga = sinon.spy();
	},

	afterEach: function() {
		// Remove Mock:
		window.ga = undefined;
		delete(window.ga);
	}
});

QUnit.test('should call track event on analytics api', function(assert) {
		this.context.dispatch('test:run', {
			category: 'fake-category',
			action: 'fake-action',
			label: 'fake-label',
			value: 100
		});

		assert.ok(window.ga.calledOnce);
		assert.equal(window.ga.getCall(0).args[0], 'send');
		assert.equal(window.ga.getCall(0).args[1], 'event');
		assert.equal(window.ga.getCall(0).args[2], 'fake-category');
		assert.equal(window.ga.getCall(0).args[3], 'fake-action');
		assert.equal(window.ga.getCall(0).args[4], 'fake-label');
		assert.equal(window.ga.getCall(0).args[5], 100);
});

QUnit.test('should fail when missing to send "category"', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run', {
			action: 'fake-action'
		});
	}, /Missing category for trackevent call/);
});

QUnit.test('should fail when missing to send "action"', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run', {
			category: 'fake-category'
		});
	}, /Missing action for trackevent call/);
});

QUnit.test('should not fail when missing to send "label"', function(assert) {
	this.context.dispatch('test:run', {
		category: 'fake-category',
		action: 'fake-action'
	});

	// Everything went good...
	assert.ok(true);
});

QUnit.test('should not fail when missing to send "value"', function(assert) {
	this.context.dispatch('test:run', {
		category: 'fake-category',
		action: 'fake-action',
		label: 'fake-label'
	});

	// Everything went good...
	assert.ok(true);
});

QUnit.test('should fail when sending "value" without "label"', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run', {
			category: 'fake-category',
			action: 'fake-action',
			value: 100
		});
	}, /The add a label for trackevent call when sending a value/);
});

QUnit.test('should fail when type of "value" is not a number', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run', {
			category: 'fake-category',
			action: 'fake-action',
			label: 'fake-label',
			value: '100'
		});
	}, /The value to send must be type of number for trackevent call/);
});
