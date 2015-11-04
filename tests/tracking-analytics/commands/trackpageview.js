/* global QUnit, sinon */
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/tracking-analytics/commands/TrackPageview';


QUnit.module('The tracking-analytics trackpageview command', {
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

QUnit.test('should call track pageview on analytics api', function(assert) {
		// Mock Google Analytics:
		this.gaCalls = [];
		window.ga = sinon.spy();

		this.context.dispatch('test:run', {
			path: '/fake-path/'
		});

		assert.ok(window.ga.calledOnce);
		assert.equal(window.ga.getCall(0).args[0], 'send');
		assert.equal(window.ga.getCall(0).args[1], 'pageview');
		assert.equal(window.ga.getCall(0).args[2], '/fake-path/');

		window.ga = undefined;
		delete(window.ga);
});

QUnit.test('should fail when missing to send "path"', function(assert) {
	var self = this;
	assert.throws(function() {
		self.context.dispatch('test:run');
	}, /Missing path for trackpageview call/);
});
