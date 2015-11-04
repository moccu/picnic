/* global QUnit, sinon */
import $ from 'jquery';
import _ from 'underscore';
import Geppetto from 'backbone.geppetto';
import ApiLoader from 'picnic/youtubeplayer/services/ApiLoader';

QUnit.module('The youtubeplayer apiloader', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
		this.loader = new ApiLoader({
			url: 'foo://bar.baz/api'
		});
	},

	afterEach: function() {
		// Clear callbacks
		window.onYouTubeIframeAPIReady = undefined;
		delete(window.onYouTubeIframeAPIReady);

		// Clear namespace:
		window.YT = undefined;
		delete(window.YT);

		// Remove scriptblocks:
		$('script[src="foo://bar.baz/api"]').remove();
	}

});

QUnit.test('should return a deferred object', function(assert) {
	var
		deferred = this.loader.requestPlayer(),
		compare = $.Deferred()
	;

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
	var
		requestA = this.loader.requestPlayer(),
		requestB = this.loader.requestPlayer()
	;

	assert.equal(requestA, requestB, 'The deferred objects are not equal');
});

QUnit.test('should load api and add callback', function(assert) {
	this.loader.requestPlayer();

	assert.ok(typeof window.onYouTubeIframeAPIReady, 'function', 'The global callback was\'t added');
	assert.ok($('script[src="foo://bar.baz/api"]').length === 1, 'The script block does not exsist');
});

QUnit.test('should append scriptblock only once', function(assert) {
	var script;

	this.loader.requestPlayer();
	this.loader.requestPlayer();

	script = $('script[src="foo://bar.baz/api"]');
	assert.ok(
		script.length === 1,
		'The script block not added once'
	);
	assert.equal(script[0].src, 'foo://bar.baz/api', 'Script has incorrect source');
	assert.equal(script[0].type, 'text/javascript', 'Script has incorrect type');
	assert.equal(script[0].async, true, 'Script is not async');
});

QUnit.test('should append scriptblock only once over multiple instances', function(assert) {
	var
		loaderA = new ApiLoader({url: 'foo://bar.baz/api'}),
		loaderB = new ApiLoader({url: 'foo://bar.baz/api'})
	;

	loaderA.requestPlayer();
	loaderB.requestPlayer();

	assert.ok(
		$('script[src="foo://bar.baz/api"]').length === 1,
		'The script block not added once'
	);
});

QUnit.test('should resolve player', function(assert) {
	var callback = sinon.spy();

	this.loader.requestPlayer().then(callback);

	assert.ok(!callback.calledOnce, 'The callback ware already called');
	assert.equal(typeof window.onYouTubeIframeAPIReady, 'function', 'The global callback is missing');

	// Simulate loaded namespace...
	window.YT = {Player: function() {}};
	window.onYouTubeIframeAPIReady();

	assert.ok(callback.calledOnce, 'The player is not resolved');
	assert.equal(callback.getCall(0).args[0], window.YT.Player, 'The player is not given');
});

QUnit.test('should resolve player when already loaded', function(assert) {
	var callback = sinon.spy();

	// Simulate loaded namespace...
	window.YT = {Player: function() {}};

	this.loader.requestPlayer().then(callback);

	assert.ok(callback.calledOnce, 'The player is not resolved');
	assert.equal(callback.getCall(0).args[0], window.YT.Player, 'The player is not given');
	assert.equal(window.onYouTubeIframeAPIReady, undefined, 'An unexpected callback is added');
});

QUnit.test('not overwrite existing global callbacks', function(assert) {
	var
		callback = sinon.spy(),
		globalCallback = sinon.spy()
	;

	window.onYouTubeIframeAPIReady = globalCallback;
	this.loader.requestPlayer().then(callback);

	assert.equal(typeof window.onYouTubeIframeAPIReady, 'function', 'The global callback is not added correctly');
	assert.notEqual(window.onYouTubeIframeAPIReady, globalCallback, 'The previously added callback was not nested by an other callback');

	// Simulate loaded namespace...
	window.YT = {Player: function() {}};
	window.onYouTubeIframeAPIReady();

	assert.ok(globalCallback.calledOnce, 'The previously added global callback was not called');
	assert.equal(globalCallback.getCall(0).args[0], window.YT.Player, 'The player class was not given');

	assert.ok(callback.calledOnce, 'The local callback was not called');
	assert.equal(callback.getCall(0).args[0], window.YT.Player, 'The player class was not given');
});
