/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/googletagmanager/commands/TrackEvent';


QUnit.module('The googletagmanager trackevent command', {

	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:event', Command);
		this.eventData = {
			category: 'test-category',
			action: 'test-action',
			label: 'test-label',
			value: 1
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
			event: 'uaevent',
			eventCategory: 'test-category',
			eventAction: 'test-action',
			eventLabel: 'test-label',
			eventValue: 1
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
			trackeventName: 'fooevent'
		});
		this.context.dispatch('test:event', this.eventData);

		assert.deepEqual(window.dataLayer[0], {
			event: 'fooevent',
			eventCategory: 'test-category',
			eventAction: 'test-action',
			eventLabel: 'test-label',
			eventValue: 1
		});
	}
);

QUnit.test(
	'should fail when missing category in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		delete(data.category);

		assert.throws(function() {
			this.context.dispatch('test:event', data);
		}.bind(this), new Error('Missing category for trackevent call'));
	}
);

QUnit.test(
	'should fail when missing action in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		delete(data.action);

		assert.throws(function() {
			this.context.dispatch('test:event', data);
		}.bind(this), new Error('Missing action for trackevent call'));
	}
);

QUnit.test(
	'should fail when missing label when sending a value in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		delete(data.label);

		assert.throws(function() {
			this.context.dispatch('test:event', data);
		}.bind(this), new Error('Add a label for trackevent call when sending a value'));
	}
);

QUnit.test(
	'should fail when value is not a number in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		data.value = '1';

		assert.throws(function() {
			this.context.dispatch('test:event', data);
		}.bind(this), new Error('The value to send must be type of number for trackevent call'));
	}
);
