/* global QUnit, sinon */
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/tracking-analytics/commands/TrackSocial';


QUnit.module('The tracking-analytics tracksocial command', {
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

QUnit.test('should call track social on analytics api', function(assert) {
		// Mock Google Analytics:
		this.gaCalls = [];
		window.ga = sinon.spy();

		this.context.dispatch('test:run', {
			network: 'fake-network',
			action: 'fake-action',
			targetUrl: 'fake-target-url',
			pagePathUrl: 'fake-page-path-url'
		});

		assert.ok(window.ga.calledOnce);
		assert.equal(window.ga.getCall(0).args[0], 'send');
		assert.equal(window.ga.getCall(0).args[1], 'social');
		assert.equal(window.ga.getCall(0).args[2], 'fake-network');
		assert.equal(window.ga.getCall(0).args[3], 'fake-action');
		assert.equal(window.ga.getCall(0).args[4], 'fake-target-url');
		assert.equal(window.ga.getCall(0).args[5], 'fake-page-path-url');

		window.ga = undefined;
		delete(window.ga);
});

QUnit.test('should fail when missing to send "network"', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run', {

		});
	}, /Missing network for tracksocial call/);
});

QUnit.test('should fail when missing to send "action"', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run', {
			network: 'fake-network'
		});
	}, /Missing action for tracksocial call/);
});

QUnit.test('should fail when try to send "pagePathUrl" without "targetUrl"', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run', {
			network: 'fake-network',
			action: 'fake-action',
			pagePathUrl: 'fake-page-path-url'
		});
	}, /The add a targetUrl for trackevent call when sending a pagePathUrl/);
});
