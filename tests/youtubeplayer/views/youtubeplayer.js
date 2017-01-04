/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Mediaplayer from 'picnic/mediaplayer/views/Mediaplayer';
import YoutubeplayerView from 'picnic/youtubeplayer/views/Youtubeplayer';
import ApiLoader from 'picnic/youtubeplayer/services/ApiLoader';
import Fixure from 'tests/youtubeplayer/views/fixtures/youtubeplayer.html!text';
import MockPlayer from 'tests/youtubeplayer/views/mocks/Player';

QUnit.module('The youtubeplayer view', {

	beforeEach: function() {
		var root = $('#qunit-fixture');
		$(Fixure).appendTo(root);

		window.YT = {
			Player: MockPlayer,
			PlayerState: {
				ENDED: 'ended',
				PLAYING: 'playing',
				PAUSED: 'paused'
			}
		};

		this.root = root;
		this.context = new Geppetto.Context();
		this.loader = new ApiLoader({url: 'foo://bar.baz/api'});
		this.view = new YoutubeplayerView({
			el: root.find('.player')[0],
			context: this.context,
			loader: this.loader
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

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);

QUnit.test(
	'should be an instance of Mediaplayer',
	function(assert) {
		assert.ok(this.view instanceof Mediaplayer, 'Has not the correct base class');
	}
);

QUnit.test(
	'should return correct youtube id',
	function(assert) {
		assert.equal(
			this.view.getVideoId(),
			'07So_lJQyqw',
			'The Youtube Id is not returned correctly'
		);
	}
);

QUnit.test(
	'should use apiloaderand load api',
	function(assert) {
		var
			self = this,
			spy = sinon.spy(),
			original = this.loader.requestPlayer
		;

		// Mock the api loader's requestPlayer() function
		this.loader.requestPlayer = function() {
			spy();
			return original.apply(self.loader, arguments);
		};

		this.view.render();
		this.view.play();
		assert.ok(spy.calledOnce, 'Did\'t used the api loader');
		assert.ok(this.view.$el.hasClass('loading'), 'Missing classname loading on element');
	}
);

QUnit.test(
	'should render player on play() call',
	function(assert) {
		this.view.render();
		this.view.play();

		assert.equal(this.view.$el.find('> div').length, 1, 'Didn\'t render the container div');
		assert.equal(this.view.$el.find('iframe').length, 1, 'Did\'t render the iframe');
		assert.equal(this.view.$el.find('> div')[0], window.YT.playerInstances[0].el, 'Use incorrect container');
		assert.equal(this.view.getVideoId(), window.YT.playerInstances[0].settings.videoId, 'Use incorrect video id');
	}
);

QUnit.test(
	'should call stop and pause',
	function(assert) {
		this.view.render();
		this.view.play();

		window.YT.playerInstances[0].stopVideo = sinon.spy();
		window.YT.playerInstances[0].pauseVideo = sinon.spy();

		this.view.stop();
		assert.ok(window.YT.playerInstances[0].stopVideo.calledOnce);

		this.view.pause();
		assert.ok(window.YT.playerInstances[0].pauseVideo.calledOnce);
	}
);

QUnit.test('should trigger events on play() and stop() calls',
	function(assert) {
		var
			callbackMediaPlay = sinon.spy(),
			callbackYoutubePlay = sinon.spy(),
			callbackYoutubeStop = sinon.spy()
		;

		this.context.vent
			.on('mediaplayer:play', callbackMediaPlay)
			.on('youtubeplayer:play', callbackYoutubePlay)
			.on('youtubeplayer:stop', callbackYoutubeStop);

		this.view.render();
		this.view.play();

		window.YT.playerInstances[0].triggerReady();

		this.view.stop();

		assert.ok(callbackMediaPlay.calledOnce);
		assert.ok(callbackYoutubePlay.calledOnce);
		assert.ok(callbackYoutubeStop.calledOnce);
	}
);

QUnit.test(
	'should trigger progress updates',
	function(assert) {
		var
			clock = sinon.useFakeTimers(),
			callback = sinon.spy()
		;

		this.context.vent.on('youtubeplayer:updateprogress', callback);

		this.view.render();
		this.view.play();

		window.YT.playerInstances[0].triggerReady();

		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0], this.view, 'The instance is not given');
		assert.equal(callback.getCall(0).args[0].getProgress(), 0, 'The progress is not correct');

		window.YT.playerInstances[0].triggerProgress();
		clock.tick(1000);

		assert.equal(callback.callCount, 2, 'The call count is not correct');
		assert.equal(callback.getCall(1).args[0], this.view, 'The instance is not given');
		assert.equal(callback.getCall(1).args[0].getProgress(), 10, 'The progress in percent is not correct');

		window.YT.playerInstances[0].triggerProgress();
		clock.tick(1000);

		assert.equal(callback.callCount, 3, 'The call count is not correct');
		assert.equal(callback.getCall(2).args[0], this.view, 'The instance is not given');
		assert.equal(callback.getCall(2).args[0].getProgress(), 20, 'The progress in percent is not correct');
	}
);

QUnit.test(
	'should trigger play on click on link',
	function(assert) {
		var events;

		this.view.render();
		events = $._data(this.view.$el.find('a')[0], 'events');
		assert.deepEqual(Object.keys(events), ['click'], 'The link element has click events');

		this.view.$el.find('a').trigger(new $.Event('click'));
		window.YT.playerInstances[0].triggerReady();
		assert.equal(this.view.$el.find('iframe').length, 1, 'Did\'t render the iframe');
	}
);

QUnit.test('should destroy the player', function(assert) {
	var events;
	this.view.render();
	this.view.$el.find('a').trigger(new $.Event('click'));
	this.view.destroy();

	events = $._data(this.view.$el.find('a')[0], 'events');
	assert.ok(window.YT.playerInstances[0].isDestroyed, 'The player is destroyed');
	assert.equal(events, undefined, 'The link element has no click and further events');
});
