/* global QUnit, sinon */
import $ from 'jquery';
import _ from 'underscore';
import Geppetto from 'backbone.geppetto';
import Mediaplayer from 'picnic/mediaplayer/views/Mediaplayer';
import vimeoplayerView from 'picnic/vimeoplayer/views/Vimeoplayer';
import ApiLoader from 'picnic/vimeoplayer/services/ApiLoader';
import Fixture from 'tests/vimeoplayer/views/fixtures/vimeoplayer.html!text';
import MockPlayer from 'tests/vimeoplayer/views/mocks/Player';

var fixture = _.template(Fixture),
	EL = '.vimeoplayer',
	VIDEOID = '11673745',
	APIURL = 'foo://bar.baz/api';

QUnit.module('The vimeoplayer view', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');

		// Append Fixture
		$(fixture({id: VIDEOID})).appendTo(this.root);

		// Mock player API
		window.Vimeo = {
			Player: MockPlayer
		};

		this.context = new Geppetto.Context();
		this.loader = new ApiLoader({url: APIURL});
		this.view = new vimeoplayerView({
			el: this.root.find(EL)[0],
			context: this.context,
			loader: this.loader
		});
	},

	afterEach: function() {
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
	var spy = sinon.spy(this.loader, 'requestPlayer');

	this.view.render();
	this.view.play();
	assert.ok(spy.calledOnce, 'Did not used the API loader');
	assert.ok(this.view.$el.hasClass(this.view.options.classLoading), 'Missing loading class on element');
	assert.equal(this.view.$el.find('iframe').length, 1, 'Did not render the video iFrame');
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

	this.view = new vimeoplayerView(options);
	assert.equal(this.view.options.eventNamespace, options.eventNamespace, 'Did not change the eventNamespace option');
	assert.equal(this.view.options.classLoading, options.classLoading, 'Did not change the classLoading option');
	assert.equal(this.view.options.classPlaying, options.classPlaying, 'Did not change the classPlaying option');
	assert.ok(this.view.options.playerOptions.autoplay, 'Missing autoplay option');
	assert.ok(this.view.options.playerOptions.width, 'Missing width option');
});

QUnit.test('should call stop, play and pause methods', function(assert) {
	this.view.render();
	this.view.play();

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
	assert.equal(this.view.$el.find('iframe').length, 1, 'Did not render the video iFrame');
});

QUnit.test('should trigger updateProgress method', function(assert) {
	var
		duration = 10000,
		callback = sinon.spy(),
		clock = sinon.useFakeTimers()
	;

	this.context.vent.on(this.view.options.eventNamespace + ':updateprogress', callback);
	this.view.render();
	this.view.play();

	assert.equal(this.view.getProgress(), -1, 'The progress should be -1');

	this.view._setProgress(clock.now, duration);
	assert.ok(callback.calledOnce, 'The call count should be 1');
	assert.equal(this.view.getProgress(), 0, 'The progress should be 0');

	clock.tick(1000);
	this.view._setProgress(clock.now, duration);
	assert.ok(callback.calledTwice, 'The call count should be 2');
	assert.equal(this.view.getProgress(), 10, 'The progress should be 10');

	clock.tick(1000);
	this.view._setProgress(clock.now, duration);
	assert.ok(callback.calledThrice, 'The call count should be 3');
	assert.equal(this.view.getProgress(), 20, 'The progress should be 20');

	this.view.stop();

	assert.equal(this.view.getProgress(), -1, 'The progress should be -1');
});

QUnit.test('should destroy the player', function(assert) {
	this.view.render();
	this.view.play();
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
});
