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
		var root = $('#qunit-fixture');

		// Append Fixture
		$(fixture({id: VIDEOID})).appendTo(root);

		// Mock player API
		window.Vimeo = {
			Player: MockPlayer
		};

		this.root = root;
		this.context = new Geppetto.Context();
		this.loader = new ApiLoader({url: APIURL});
		this.view = new vimeoplayerView({
			el: root.find(EL)[0],
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
	'should return correct video ID',
	function(assert) {
		assert.equal(this.view.getVideoId(), VIDEOID, 'The video ID is not returned correctly');
	}
);

QUnit.test(
	'should load the API and render the player',
	function(assert) {
		var spy = sinon.spy(this.loader, 'requestPlayer');

		this.view.render();
		this.view.play();
		assert.ok(spy.calledOnce, 'Did not used the API loader');
		assert.ok(this.view.$el.hasClass(this.view.options.classLoading), 'Missing loading class on element');
		assert.equal(this.view.$el.find('iframe').length, 1, 'Did not append video iFrame');
	}
);

QUnit.test(
	'should call stop, play and pause',
	function(assert) {
		this.view.render();
		this.view.play();

		var spyStop = sinon.spy(this.view._player, 'unload'),
			spyPlay = sinon.spy(this.view._player, 'play'),
			spyPause = sinon.spy(this.view._player, 'pause');

		this.view.stop();
		assert.ok(spyStop.calledOnce, 'Did not used the stop method');

		this.view.play();
		assert.ok(spyPlay.calledOnce, 'Did not used the play method');

		this.view.pause();
		assert.ok(spyPause.calledOnce, 'Did not used the pause method');
	}
);
