/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import MediaplayerView from 'picnic/mediaplayer/views/Mediaplayer';
import Fixure from 'tests/mediaplayer/views/fixures/mediaplayer.html!text';

QUnit.module('The mediaplayer view', {

	beforeEach: function() {
		var root = $('#qunit-fixture');
		$(Fixure).appendTo(root);

		this.root = root;
		this.context = new Geppetto.Context();
		this.view = new MediaplayerView({
			el: root.find('.mediaplayer')[0],
			context: this.context
		});
	}

});

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);

QUnit.test('should throw an error when call the basic stopMedia()', function(assert) {
	var self = this;
	this.view.render();

	assert.throws(function() {
		self.view.stopMedia();
	}, 'The stopMedia function didn\'t raise an exception');
});

QUnit.test('should trigger an event when playMedia() was called', function(assert) {
	var callback = sinon.spy();
	this.context.vent.on('mediaplayer:play', callback);
	this.view.render();
	this.view.playMedia();

	assert.ok(callback.calledOnce);
	assert.equal(callback.getCall(0).args[0].instance, this.view);
});

QUnit.test('should toggle stopMedia() when an other instance calls playMedia()', function(assert) {
	this.view.render();
	this.view.stopMedia = sinon.spy();

	var
		other = new MediaplayerView({
			el: this.root.find('.mediaplayer')[1],
			context: this.context
		}).render()
	;

	other.playMedia();
	assert.ok(this.view.stopMedia.calledOnce);
});

QUnit.test('should not toggle stopMedia() when self calling playMedia()', function(assert) {
	this.view.render();
	this.view.stopMedia = sinon.spy();
	this.view.playMedia();
	assert.equal(this.view.stopMedia.callCount, 0);
});
