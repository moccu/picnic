/* global QUnit, sinon */
import $ from 'jquery';
import _ from 'underscore';
import Geppetto from 'backbone.geppetto';
import ApiLoader from 'picnic/vimeoplayer/services/ApiLoader';

var APIURL = 'foo://bar.baz/api';

QUnit.module('The vimeoplayer apiloader', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
		this.loader = new ApiLoader({
			url: APIURL
		});
	},

	afterEach: function() {
		// Clear player API namespace
		window.Vimeo = undefined;
		delete(window.Vimeo);

		// Remove script tags:
		$('script[src="' + APIURL + '"]').remove();
	}

});

QUnit.test('should return a deferred object', function(assert) {
	var deferred = this.loader.requestPlayer(),
		compare = $.Deferred();

	_.each(compare, function(value, key) {
		assert.equal(
			typeof deferred[key],
			typeof compare[key],
			'The property "' + key + '" of the returned deferred object did ' +
			'not match the type of the compared object'
		);
	});
});

QUnit.test('should return same deferred object', function(assert) {
	var requestA = this.loader.requestPlayer(),
		requestB = this.loader.requestPlayer();

	assert.equal(requestA, requestB, 'The deferred objects are not equal');
});

QUnit.test('should load api script', function(assert) {
	this.loader.requestPlayer();

	assert.equal($('script[src="' + APIURL + '"]').length, 1, 'The script tag does not exist');
});

QUnit.test('should append the api script only once', function(assert) {
	this.loader.requestPlayer();
	this.loader.requestPlayer();

	var $script = $('script[src="' + APIURL + '"]');

	assert.equal($script.length, 1, 'The script tag was not added once');
	assert.equal($script[0].src, APIURL, 'The script has a incorrect source');
	assert.equal($script[0].type, 'text/javascript', 'The script has a incorrect type');
	assert.equal($script[0].async, true, 'The script is not async');
});

QUnit.test('should append the api script only once over multiple instances', function(assert) {
	var loaderA = new ApiLoader({url: APIURL}),
		loaderB = new ApiLoader({url: APIURL});

	loaderA.requestPlayer();
	loaderB.requestPlayer();

	assert.equal($('script[src="' + APIURL + '"]').length, 1, 'The script tag was not added once');
});

QUnit.test('should resolve player when already loaded', function(assert) {
	var callback = sinon.spy();

	// Mock player
	window.Vimeo = {Player: function() {}};

	this.loader.requestPlayer().then(callback);

	assert.ok(callback.calledOnce, 'The player is not resolved');
	assert.equal(callback.getCall(0).args[0], window.Vimeo.Player, 'The player is not given');
});
