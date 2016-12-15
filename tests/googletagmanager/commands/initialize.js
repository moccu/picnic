/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import InitializeCommand from 'picnic/googletagmanager/commands/Initialize';


QUnit.module('The googletagmanager initialize command', {

	beforeEach: function() {
		$('body').off('click');

		// Mock the system time...
		this.clock = sinon.useFakeTimers();
		this.clock.tick(1469192767600);

		// Create objects and wireings
		this.context = new Geppetto.Context();
		this.context.wireValue('googletagmanager:settings', {
			id: 'GTM-FOOBAR1',
			source: 'foo://bar.baz/gtm.js?id='
		});
		this.context.wireCommand('test:initialize', InitializeCommand);
	},

	afterEach: function() {
		this.clock.restore();

		$('body').off('click');
		$('script[src^="foo://bar.baz/gtm.js"]').remove();

		window.dataLayer = undefined;
		delete(window.dataLayer);
	}

});

QUnit.test(
	'should initialize script with given options',
	function(assert) {
		this.context.dispatch('test:initialize');
		assert.deepEqual(window.dataLayer, [{
			'gtm.start': 1469192767600,
			'event': 'gtm.js'
		}]);
		assert.equal($('script[src="foo://bar.baz/gtm.js?id=GTM-FOOBAR1"]').length, 1);
	}
);

QUnit.test(
	'should use layer namespace from settings',
	function(assert) {
		this.context.wireValue('googletagmanager:settings', {
			id: 'GTM-FOOBAR1',
			source: 'foo://bar.baz/gtm.js?id=',
			layer: 'customLayer'
		});
		this.context.dispatch('test:initialize');
		assert.deepEqual(window.customLayer, [{
			'gtm.start': 1469192767600,
			'event': 'gtm.js'
		}]);
		assert.equal(window.dataLayer, undefined);

		// Cleanup:
		window.customLayer = undefined;
		delete(window.customLayer);
	}
);

QUnit.test(
	'should fail when ID was not configured in options',
	function(assert) {
		// Remove ID from configuration
		this.context.wireValue('googletagmanager:settings', {
			source: 'foo://bar.baz/gtm.js?id='
		});

		assert.throws(function() {
			// The callback, which triggers the setup of the google tag manager
			// should result in an exception for the missing google tag
			// manager ID...
			this.context.dispatch('test:initialize');
		}, /Missing Google Tag Manager ID/);
	}
);

QUnit.test(
	'should not initialize when not enabled',
	function(assert) {
		// Disable via configuration
		this.context.wireValue('googletagmanager:settings', {
			id: 'GTM-FOOBAR1',
			enabled: false,
			source: 'foo://bar.baz/gtm.js?id='
		});

		this.context.dispatch('test:initialize');
		assert.equal($('script[src="foo://bar.baz/gtm.js?id=GTM-FOOBAR1"]').length, 0);
	}
);

QUnit.test(
	'should push initial values into data layer when defined in settings',
	function(assert) {
		this.context.wireValue('googletagmanager:settings', {
			id: 'GTM-FOOBAR1',
			source: 'foo://bar.baz/gtm.js?id=',
			initialLayerPushs: [
				{
					foo: 'foo'
				}, {
					bar: 'bar'
				}
			]
		});
		this.context.dispatch('test:initialize');

		assert.deepEqual(window.dataLayer, [
			{
				foo: 'foo'
			}, {
				bar: 'bar'
			}, {
				'gtm.start': 1469192767600,
				'event': 'gtm.js'
			}
		]);
	}
);
