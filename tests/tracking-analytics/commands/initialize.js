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
			self.gaCalls.push(Array.prototype.slice.call(arguments));
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

		assert.deepEqual(this.gaCalls, [
			// Test create call:
			['create', 'UA-FOOBAR-1', 'foo.bar.baz'],
			// Test for anonymize call:
			['set', 'anonymizeIp', true],
			// Test for displayfeatures call:
			['require', 'displayfeatures'],
			// Test for initial pageview call:
			['send', 'pageview', 'omg' + document.location.pathname]
		]);

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

QUnit.test(
	'should apply initial calls from settings',
	function(assert) {

		// Setup analytics
		this.context.wireValue('tracking-analytics:settings', {
			id: 'UA-FOOBAR-1',
			hostname: 'foo.bar.baz',
			pageviewPrefix: 'omg',
			source: 'foo://bar.baz/analytics.js',
			initialCalls: [
				['set', 'foo'],
				['set', 'bar', 'baz']
			]
		});

		// Call command:
		this.context.dispatch('test:initialize');

		assert.deepEqual(this.gaCalls, [
			// Test create call:
			['create', 'UA-FOOBAR-1', 'foo.bar.baz'],
			// Test for anonymize call:
			['set', 'anonymizeIp', true],
			// Test for displayfeatures call:
			['require', 'displayfeatures'],
			// Test for configured initial calls:
			['set', 'foo'],
			['set', 'bar', 'baz'],
			// Test for initial pageview call:
			['send', 'pageview', 'omg' + document.location.pathname]
		]);

		assert.equal($('script[src="foo://bar.baz/analytics.js"]').length, 1);
	}
);

QUnit.test(
	'should set custom pageview params',
	function(assert) {
		var
			pageview = {
				'dimension1': 'custom-pageview'
			}
		;

		// Setup analytics
		this.context.wireValue('tracking-analytics:settings', {
			id: 'UA-FOOBAR-1',
			source: 'foo://bar.baz/analytics.js',
			hostname: 'foo.bar.baz',
			pageviewParam: pageview
		});

		// Call command:
		this.context.dispatch('test:initialize');

		assert.deepEqual(this.gaCalls, [
			// Test create call:
			['create', 'UA-FOOBAR-1', 'foo.bar.baz'],
			// Test for anonymize call:
			['set', 'anonymizeIp', true],
			// Test for displayfeatures call:
			['require', 'displayfeatures'],
			// Test for custom pageview params:
			['send', 'pageview', pageview]
		]);
	}
);

QUnit.test(
	'should deactivate automatic pageview',
	function(assert) {
		// Setup analytics
		this.context.wireValue('tracking-analytics:settings', {
			id: 'UA-FOOBAR-1',
			source: 'foo://bar.baz/analytics.js',
			hostname: 'foo.bar.baz',
			autoPageview: false
		});

		// Call command:
		this.context.dispatch('test:initialize');

		assert.deepEqual(this.gaCalls, [
			// Test create call:
			['create', 'UA-FOOBAR-1', 'foo.bar.baz'],
			// Test for anonymize call:
			['set', 'anonymizeIp', true],
			// Test for displayfeatures call:
			['require', 'displayfeatures']
		]);
	}
);

QUnit.test(
	'should override getter for pageview',
	function(assert) {
		this.context.wireValue('tracking-analytics:settings', {
			id: 'UA-FOOBAR-1',
			source: 'foo://bar.baz/analytics.js',
			hostname: 'foo.bar.baz',
			pageviewParam: 'bar'
		});

		class Command extends InitializeCommand {
			get pageview() {
				return 'foo';
			}
		}

		var instance = new Command();
		instance.context = this.context;
		instance.execute();

		assert.deepEqual(this.gaCalls, [
			// Test create call:
			['create', 'UA-FOOBAR-1', 'foo.bar.baz'],
			// Test for anonymize call:
			['set', 'anonymizeIp', true],
			// Test for displayfeatures call:
			['require', 'displayfeatures'],
			// Test for custom pageview params:
			['send', 'pageview', 'foo']
		]);
	}
);
