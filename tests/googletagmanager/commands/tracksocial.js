/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/googletagmanager/commands/TrackSocial';


QUnit.module('The googletagmanager tracksocial command', {

	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:event', Command);
		this.eventData = {
			network: 'test-network',
			action: 'test-action',
			targetUrl: 'test-targetUrl'
		};

		window.dataLayer = [];
	},

	afterEach: function() {
		window.dataLayer = undefined;
		delete(window.dataLayer);
	}

});

QUnit.test(
	'should pass expected data into datalayer',
	function(assert) {
		this.context.dispatch('test:event', this.eventData);

		assert.deepEqual(window.dataLayer[0], {
			event: 'socialInt',
			socialNetwork: 'test-network',
			socialAction: 'test-action',
			socialTarget: 'test-targetUrl'
		});
	}
);

QUnit.test(
	'should use custom dataLayer property when defined in settings',
	function(assert) {
		window.customLayer = [];
		this.context.wireValue('googletagmanager:settings', {
			layer: 'customLayer'
		});
		this.context.dispatch('test:event', this.eventData);

		assert.ok(window.customLayer.length === 1);
		window.customLayer = undefined;
		delete(window.customLayer);
	}
);

QUnit.test(
	'should use custom trackeventName property when defined in settings',
	function(assert) {
		this.context.wireValue('googletagmanager:settings', {
			tracksocialName: 'fooevent'
		});
		this.context.dispatch('test:event', this.eventData);

		assert.deepEqual(window.dataLayer[0], {
			event: 'fooevent',
			socialNetwork: 'test-network',
			socialAction: 'test-action',
			socialTarget: 'test-targetUrl'
		});
	}
);

QUnit.test(
	'should fail when missing network in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		delete(data.network);

		assert.throws(function() {
			this.context.dispatch('test:event', data);
		}.bind(this), new Error('Missing network for tracksocial call'));
	}
);

QUnit.test(
	'should fail when missing action in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		delete(data.action);

		assert.throws(function() {
			this.context.dispatch('test:event', data);
		}.bind(this), new Error('Missing action for tracksocial call'));
	}
);
