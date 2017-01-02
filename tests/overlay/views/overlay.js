/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Overlay from 'picnic/overlay/views/Overlay';

var
	CONTENT = '<p>Sample content</p>',
	CUSTOM_CLOSE_LABEL = 'This is my custom close label',
	CUSTOM_CLOSE_TITLE = 'This is my custom close title'
;


QUnit.module('The overlay view', {

	beforeEach: function() {
		var root = $('#qunit-fixture');

		// Mock Modernizr:
		window.Modernizr = {csstransitions: true};

		this.root = root;
		this.context = new Geppetto.Context();
		this.view = new Overlay({
			context: this.context,
			target: this.root,
			content: CONTENT
		});
	},

	afterEach: function() {
		// Remove Modernizr mock:
		window.Modernizr = undefined;
		delete(window.Modernizr);
		this.root.css('overflow', '');
	}

});

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);

QUnit.test(
	'should append to correct target element',
	function(assert) {
		this.view.render();

		assert.equal(this.root.find('> .overlay').length, 1, 'The overlay wasn\'t attached to the target element');
		assert.equal(this.root.find('> .overlay > .overlay-content').length, 1, 'The overlay content wasn\'t attached to the target element');
		assert.equal(this.root.find('> .overlay > .overlay-content > p').length, 1, 'The content wasn\'t attached to the target element');
	}
);

QUnit.test(
	'should return correct elements from getters',
	function(assert) {
		this.view.render();

		assert.equal(this.view.getContainer()[0], this.root.find('.overlay')[0]);
		assert.equal(this.view.getContent()[0], this.root.find('.overlay .overlay-content p')[0]);
	}
);

QUnit.test(
	'should take custom close label and title',
	function(assert) {
		this.view = new Overlay({
			context: this.context,
			target: this.root,
			content: CONTENT,
			closeLabel: CUSTOM_CLOSE_LABEL,
			closeTitle: CUSTOM_CLOSE_TITLE
		}).render();

		assert.equal(this.view.getContainer().find('.close').attr('title'), CUSTOM_CLOSE_TITLE, 'The close title attribute is not the custom one');
		assert.equal($.trim(this.view.getContainer().find('.close').text()), CUSTOM_CLOSE_LABEL, 'The close label is not the custom one');
	}
);

QUnit.test(
	'should open and close, should return correct getter value for "isOpen"',
	function(assert) {
		this.view.render();
		assert.ok(!this.view.getContainer().hasClass('open'), 'The overlay shouldn\'t already be open intially');
		assert.ok(!this.view.isOpen);

		this.view.open();
		assert.ok(this.view.getContainer().hasClass('open'), 'The overlay is not open');
		assert.ok(this.view.isOpen);

		this.view.close();
		assert.ok(!this.view.getContainer().hasClass('open'), 'The overlay is still open');
		assert.ok(!this.view.isOpen);
	}
);

QUnit.test(
	'should change class name when calling addClass()',
	function(assert) {
		this.view.render();
		this.view.addClass('foobar');

		assert.ok(this.view.getContainer().hasClass('foobar'), 'The container has not the correct class');
	}
);

QUnit.test(
	'should change position when reference changes',
	function(assert) {
		this.view.render();
		this.view.open();

		assert.equal(this.view.getContainer().css('position'), 'fixed', 'The expected position is not set');
		this.view.reference = this.root;
		assert.equal(this.view.getContainer().css('position'), 'absolute', 'The expected position is not set');
		this.view.reference = 'qunit-fixture';
		assert.equal(this.view.getContainer().css('position'), 'absolute', 'The expected position is not set');
		this.view.reference = undefined;
		assert.equal(this.view.getContainer().css('position'), 'fixed', 'The expected position is not set');
	}
);

QUnit.test(
	'should update content after rendering',
	function(assert) {
		this.view.render('<p>foo</p>');
		assert.ok(this.view.getContent().text(), 'foo');

		this.view.render('<p>bar</p>');
		assert.ok(this.view.getContent().text(), 'bar');
	}
);

QUnit.test(
	'should destroy overlay after rendering',
	function(assert) {
		this.view.render();
		this.view.destroy();

		assert.ok(this.root.find('.overlay').length, 0, 'The overlay still exists');
	}
);

QUnit.test(
	'should dispatch close overlay when clicking close button',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('overlay:close', callback);
		this.view.render();
		this.view.open();

		this.view.getContainer().find('.close').trigger(new $.Event('click'));
		assert.ok(callback.calledOnce);
	}
);

QUnit.test(
	'should store information about used clickblocker',
	function(assert) {
		this.view.render();

		assert.equal(this.view.hasClickblocker, false);

		this.view.hasClickblocker = true;
		assert.equal(this.view.hasClickblocker, true);

		this.view.hasClickblocker = false;
		assert.equal(this.view.hasClickblocker, false);
	}
);

QUnit.test(
	'should store information about used scrollblocker',
	function(assert) {
		this.view.render();

		assert.equal(this.view.hasScrollblocker, false);

		this.view.hasScrollblocker = true;
		assert.equal(this.view.hasScrollblocker, true);

		this.view.hasScrollblocker = false;
		assert.equal(this.view.hasScrollblocker, false);
	}
);

QUnit.test(
	'should restore previous styles on <body>',
	function(assert) {

		//apply style on target
		this.root.attr('style', 'overflow: scroll');
		this.view.hasScrollblocker = true;
		this.view.render();

		//check if overflow hidden is applied
		assert.equal(this.root.prop('style').overflow, 'hidden');
		this.view.destroy();

		//check if previous styles are applied again
		assert.equal(this.root.prop('style').overflow, 'scroll');
	}
);

QUnit.test(
	'should remove all applied styles on <body>',
	function(assert) {

		//target has no styles on body tag
		this.root.removeAttr('style');
		this.view.hasScrollblocker = true;
		this.view.render();

		//check if overflow hidden is applied
		assert.equal(this.root.prop('style').overflow, 'hidden');
		this.view.destroy();

		//check if overflow hidden is removed
		assert.equal(this.root.prop('style').overflow, '');

	}
);
