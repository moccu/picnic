/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/tracking-fonts.com/commands/Initialize';


var
	ID = 'foo-bar-baz-1234',
	SOURCE = 'foo.bar.baz'
;


QUnit.module('The fonts.com tracking initialize command', {

	beforeEach: function() {
		// Create objects and wireings
		this.context = new Geppetto.Context();
		this.context.wireCommand('test:initialize', Command);
	},

	afterEach: function() {
		window.MTIProjectId = undefined;
		delete(window.MTIProjectId);
		$('script[src="' + SOURCE + '"]').remove();
		$('html').removeClass('cms-ready');
	}

});

QUnit.test(
	'should load "id" from settings',
	function(assert) {
		this.context.wireValue('tracking-fonts.com:settings', {
			id: ID
		});

		this.context.dispatch('test:initialize');
		assert.equal(window.MTIProjectId, ID);
	}
);

QUnit.test(
	'should load and use "source" from settings',
	function(assert) {
		this.context.wireValue('tracking-fonts.com:settings', {
			id: ID,
			source: SOURCE
		});

		this.context.dispatch('test:initialize');
		assert.equal($('script[src="' + SOURCE + '"]').length, 1);
	}
);

QUnit.test(
	'should fail when missing "id"',
	function(assert) {
		var self = this;
		assert.throws(function() {
			self.context.dispatch('test:initialize');
		}, /Missing "id" for fonts.com tracking/);
	}
);
