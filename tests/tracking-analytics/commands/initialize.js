/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import InitializeCommand from 'picnic/tracking-analytics/commands/Initialize';


QUnit.module('The tracking-analytics initialize command', {

	beforeEach: function() {
		var self = this;
		$('body').off('click');

		// Mock Google Analytics:
		this.gaCalls = [];
		window.ga = function() {
			self.gaCalls.push(arguments);
		};

		// Create objects and wireings
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:initialize', InitializeCommand);
	},

	afterEach: function() {
		$('body').off('click');
		$('script[src="foo://bar.baz/analytics.js"]').remove();
		window.ga = undefined;
		delete(window.da);
	}

});

QUnit.test(
	'should setup google analytics',
	function(assert) {

		// Setup analytics
		this.context.wireValue('tracking-analytics:settings', {
			id: 'UA-FOOBAR-1',
			hostname: 'foo.bar.baz',
			pageviewPrefix: 'omg',
			source: 'foo://bar.baz/analytics.js'
		});

		// Call command:
		this.context.dispatch('test:initialize');

		// Test create call:
		assert.equal(this.gaCalls[0][0], 'create');
		assert.equal(this.gaCalls[0][1], 'UA-FOOBAR-1');
		assert.equal(this.gaCalls[0][2], 'foo.bar.baz');

		// Test for anonymize call:
		assert.equal(this.gaCalls[1][0], 'set');
		assert.equal(this.gaCalls[1][1], 'anonymizeIp');
		assert.equal(this.gaCalls[1][2], true);

		// Test for displayfeatures call:
		assert.equal(this.gaCalls[2][0], 'require');
		assert.equal(this.gaCalls[2][1], 'displayfeatures');

		// Test for initial pageview call:
		assert.equal(this.gaCalls[3][0], 'send');
		assert.equal(this.gaCalls[3][1], 'pageview');
		assert.equal(this.gaCalls[3][2], 'omg' + document.location.pathname);

		assert.equal($('script[src="foo://bar.baz/analytics.js"]').length, 1);
	}
);

QUnit.test(
	'should fail when ID was not configured in options',
	function(assert) {
		var self = this;

		// Keep ID away from configuration
		this.context.wireValue('tracking-analytics:settings', {
			hostname: 'foo.bar.baz',
			pageviewPrefix: 'omg',
			source: 'foo://bar.baz/analytics.js'
		});

		assert.throws(function() {
			self.context.dispatch('test:initialize');
		}, /Missing Google Analytics ID/);
	}
);

QUnit.test(
	'should add optout function to global namespace (window.gaOptout())',
	function(assert) {
		// Setup analytics
		this.context.wireValue('tracking-analytics:settings', {
			id: 'UA-FOOBAR-1',
			source: 'foo://bar.baz/analytics.js'
		});

		// Call command:
		this.context.dispatch('test:initialize');

		assert.equal(typeof window.gaOptout, 'function');
	}
);

QUnit.test(
	'should set cookie when optout was called',
	function(assert) {
		var
			id = 'UA-FOOBAR-1',
			cookie = 'ga-disable-' + id
		;

		// Setup analytics
		this.context.wireValue('tracking-analytics:settings', {
			id: id,
			source: 'foo://bar.baz/analytics.js'
		});

		// Call command:
		this.context.dispatch('test:initialize');
		window.gaOptout();

		assert.ok(document.cookie.indexOf(cookie + '=true') > -1);
		document.cookie = cookie + '=true; expires=0';
	}
);
