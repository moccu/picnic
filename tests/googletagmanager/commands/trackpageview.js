/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/googletagmanager/commands/TrackPageview';


QUnit.module('The googletagmanager trackpageview command', {

	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:event', Command);
		this.eventData = {
			path: 'test-path',
			title: 'test-title'
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
			event: 'updatevirtualpath',
			virtualPageURL: 'test-path',
			virtualPageTitle: 'test-title'
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
	'should use custom trackpageviewName property when defined in settings',
	function(assert) {
		this.context.wireValue('googletagmanager:settings', {
			trackpageviewName: 'fooevent'
		});
		this.context.dispatch('test:event', this.eventData);

		assert.deepEqual(window.dataLayer[0], {
			event: 'fooevent',
			virtualPageURL: 'test-path',
			virtualPageTitle: 'test-title'
		});
	}
);

QUnit.test(
	'should fail when missing path in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		delete(data.path);

		assert.throws(function() {
			this.context.dispatch('test:event', data);
		}.bind(this), new Error('Missing path for trackpageview call'));
	}
);

QUnit.test(
	'should not fail when missing title in eventdata',
	function(assert) {
		var data = $.extend({}, this.eventData);
		delete(data.title);

		this.context.dispatch('test:event', data);

		assert.deepEqual(window.dataLayer[0], {
			event: 'updatevirtualpath',
			virtualPageURL: 'test-path',
			virtualPageTitle: undefined
		});
	}
);
