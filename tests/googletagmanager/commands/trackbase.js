/* global QUnit */
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/googletagmanager/commands/TrackBase';


QUnit.module('The googletagmanager basic track command', {

	beforeEach: function() {
		this.context = new Geppetto.Context();
		this.context.wireValue('googletagmanager:settings', {
			layer: 'customLayer'
		});
		this.eventData = {};
		this.command = new Command();
		this.command.context = this.context;
		this.command.eventData = this.eventData;

		window.customLayer = [];
	},

	afterEach: function() {
		window.customLayer = undefined;
		delete(window.customLayer);
	}

});

QUnit.test(
	'should return default settings merged with settings from namespace',
	function(assert) {
		assert.deepEqual(this.command.settings, {
			enabled: true,
			source: '//www.googletagmanager.com/gtm.js?id=',
			layer: 'customLayer',
			initialLayerPushs: [],
			trackeventName: 'uaevent',
			trackpageviewName: 'updatevirtualpath',
			tracksocialName: 'socialInt'
		});
	}
);

QUnit.test(
	'should return (and create) layer',
	function(assert) {
		assert.equal(this.command.layer, window.customLayer);
	}
);

QUnit.test(
	'should push into layer',
	function(assert) {
		this.command.push({foo: 'bar'});
		assert.deepEqual(window.customLayer, [{
			foo: 'bar'
		}]);
	}
);
