/* global QUnit, sinon */
import $ from 'jquery';
import _ from 'underscore';
import Geppetto from 'backbone.geppetto';
import Mediaplayer from 'picnic/mediaplayer/views/Mediaplayer';
import VimeoplayerView from 'picnic/vimeoplayer/views/Vimeoplayer';
import Fixture from 'tests/vimeoplayer/views/fixtures/vimeoplayer.html!text';
import MockPlayer from 'tests/vimeoplayer/views/mocks/Player';

var
	fixture = _.template(Fixture),
	EL = '.vimeoplayer',
	VIDEOID = '11673745'
;

QUnit.module('The vimeoplayer view', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');

		// Append Fixture
		$(fixture({id: VIDEOID})).appendTo(this.root);

		this.context = new Geppetto.Context();

		// Mock api loader
		this.loader = {};
		this.loader.requestPlayer = function() {
			this._request = this._request || $.Deferred();
			return this._request;
		}.bind(this.loader);
		this.loader.resolve = function() {
			// Mock player API
			window.Vimeo = window.Vimeo || {Player: MockPlayer};
			this._request.resolve(window.Vimeo.Player);
		}.bind(this.loader);
		this.loader.hasRequest = function() {
			return !!this._request;
		}.bind(this.loader);

		this.view = new VimeoplayerView({
			el: this.root.find(EL)[0],
			context: this.context
		});
		// Needs to be inserted directly because $.extend kills original reference...
		this.view.options.loader = this.loader;
	},

	afterEach: function() {
		this.view.destroy();

		// Clear player API namespace
		window.Vimeo = undefined;
		delete(window.Vimeo);
	}

});

QUnit.test('should return itself on render call', function(assert) {
	assert.equal(this.view.render(), this.view);
});

QUnit.test('should be an instance of Mediaplayer', function(assert) {
	assert.ok(this.view instanceof Mediaplayer, 'Has not the correct base class');
});

QUnit.test('should return correct video ID', function(assert) {
	assert.equal(this.view.getVideoId(), VIDEOID, 'The video ID is not returned correctly');
});

QUnit.test('should load the API and render the player', function(assert) {
	sinon.spy(this.loader, 'requestPlayer');

	this.view.render();
	this.view.play();
	assert.ok(this.loader.hasRequest());
	assert.ok(this.loader.requestPlayer.calledOnce, 'Did not used the API loader');
	assert.equal(this.view.$el.find('iframe').length, 0);
});

QUnit.test('should add class "is-loading" when api is requested', function(assert) {
	this.view.render();
	this.view.play();
	assert.ok(this.view.$el.hasClass('is-loading'), 'Did not add the "is-loading" class');
});

QUnit.test('should render iframe when api is resolved', function(assert) {
	this.view.render();
	this.view.play();
	this.loader.resolve();
	assert.equal(this.view.$el.find('iframe').length, 1);
});

QUnit.test('should extend default options', function(assert) {
	var
		options = {
			el: this.root.find(EL)[0],
			context: this.context,
			loader: this.loader,
			eventNamespace: 'vimeo',
			classLoading: 'js-loading',
			classPlaying: 'js-playing',
			playerOptions: {
				width: '600px'
			}
		}
	;

	this.view = new VimeoplayerView(options);
	assert.equal(this.view.options.eventNamespace, options.eventNamespace, 'Did not change the eventNamespace option');
	assert.equal(this.view.options.classLoading, options.classLoading, 'Did not change the classLoading option');
	assert.equal(this.view.options.classPlaying, options.classPlaying, 'Did not change the classPlaying option');
	assert.ok(this.view.options.playerOptions.autoplay, 'Missing autoplay option');
	assert.ok(this.view.options.playerOptions.width, 'Missing width option');
});

QUnit.test('should call stop, play and pause methods', function(assert) {
	this.view.render();
	this.view.play();
	this.loader.resolve();

	this.view.stop();
	assert.notEqual(window.Vimeo.callMethod.indexOf('unload'), -1, 'Did not used the unload method');

	this.view.play();
	assert.notEqual(window.Vimeo.callMethod.indexOf('play'), -1, 'Did not used the play method');

	this.view.pause();
	assert.notEqual(window.Vimeo.callMethod.indexOf('pause'), -1, 'Did not used the pause method');
});

QUnit.test('should trigger stop, play and pause calls', function(assert) {
	var
		callbackMediaPlay = sinon.spy(),
		callbackVimeoPlay = sinon.spy(),
		callbackVimeoStop = sinon.spy()
	;

	this.view.render();
	this.view.play();
	this.loader.resolve();

	this.context.vent
		.on('mediaplayer:play', callbackMediaPlay)
		.on(this.view.options.eventNamespace + ':play', callbackVimeoPlay)
		.on(this.view.options.eventNamespace + ':stop', callbackVimeoStop);

	this.view.stop();
	this.view.play();

	assert.ok(callbackMediaPlay.calledOnce, 'Did not trigger mediaplayer:play call');
	assert.ok(callbackVimeoPlay.calledOnce, 'Did not trigger vimeoplayer:play call');
	assert.ok(callbackVimeoStop.calledOnce, 'Did not trigger vimeoplayer:stop call');
});

QUnit.test('should trigger play on click', function(assert) {
	this.view.render();
	this.view.$el.find(this.view.options.trigger).trigger('click');
	assert.ok(this.loader.hasRequest());
	this.loader.resolve();
	assert.equal(this.view.$el.find('iframe').length, 1, 'Did not render the video iFrame');
});

QUnit.test('should trigger updateProgress method', function(assert) {
	var
		callback = sinon.spy(),
		clock = sinon.useFakeTimers()
	;

	this.context.vent.on(this.view.options.eventNamespace + ':updateprogress', callback);
	this.view.render();
	assert.equal(this.view.getProgress(), -1, 'The progress should be -1');

	this.view.play();
	this.loader.resolve();
	assert.ok(callback.calledOnce, 'The call count should be 1');
	assert.equal(this.view.getProgress(), 0, 'The progress should be 0');

	window.Vimeo.playerInstances[0].triggerProgress();
	clock.tick(1000);
	assert.ok(callback.calledTwice, 'The call count should be 2');
	assert.equal(this.view.getProgress(), 10, 'The progress should be 10');

	window.Vimeo.playerInstances[0].triggerProgress();
	clock.tick(1000);
	assert.ok(callback.calledThrice, 'The call count should be 3');
	assert.equal(this.view.getProgress(), 20, 'The progress should be 20');

	this.view.stop();
	assert.equal(this.view.getProgress(), -1, 'The progress should be -1');

	clock.restore();
});

QUnit.test('should destroy the player', function(assert) {
	this.view.render();
	this.view.play();
	this.loader.resolve();
	assert.notEqual(window.Vimeo.callMethod.indexOf('addEventListener:play'), -1, 'Did not add play event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('addEventListener:pause'), -1, 'Did not add pause event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('addEventListener:ended'), -1, 'Did not add ended event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('addEventListener:loaded'), -1, 'Did not add loaded event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('addEventListener:error'), -1, 'Did not add error event listener');

	this.view.destroy();
	assert.notEqual(window.Vimeo.callMethod.indexOf('removeEventListener:play'), -1, 'Did not remove play event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('removeEventListener:pause'), -1, 'Did not remove pause event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('removeEventListener:ended'), -1, 'Did not remove ended event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('removeEventListener:loaded'), -1, 'Did not remove loaded event listener');
	assert.notEqual(window.Vimeo.callMethod.indexOf('removeEventListener:error'), -1, 'Did not remove error event listener');
	assert.equal($._data(this.view.$el[0], 'events'), undefined, 'The player element should not have events');
});

QUnit.test('should destroy the player interval method', function(assert) {
	sinon.stub(window, 'clearInterval');

	this.view.render();
	this.view.play();
	this.loader.resolve();
	assert.ok(window.clearInterval.notCalled);

	this.view.destroy();
	assert.ok(window.clearInterval.calledOnce);

	window.clearInterval.restore();
});

QUnit.test(
	'should not fail when apiloader responds until player is already destroyed',
	function(assert) {
		this.view.render();
		this.view.play();
		this.view.destroy();
		this.loader.resolve();

		assert.ok(true);
	}
);
