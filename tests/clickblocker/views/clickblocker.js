/* global QUnit */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Clickblocker from 'picnic/clickblocker/views/Clickblocker';

QUnit.module('The clickblocker view', {

	beforeEach: function() {
		var root = $('#qunit-fixture');

		this.root = root;
		this.context = new Geppetto.Context();
		this.view = new Clickblocker({
			el: this.root,
			context: this.context,
			key: 'some-key'
		});
	}

});

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);

QUnit.test(
	'should not append after render() call',
	function(assert) {
		this.view.render();
		assert.equal(this.root.find('.clickblocker').length, 0);
	}
);

QUnit.test(
	'should append after open() call',
	function(assert) {
		this.view.render();
		this.view.open();

		assert.equal(this.root.find('.clickblocker').length, 1);
	}
);

QUnit.test(
	'should not append after open() call twice or more',
	function(assert) {
		this.view.render();
		this.view.open();
		this.view.open();
		this.view.open();

		assert.equal(this.root.find('.clickblocker').length, 1);
	}
);

// TODO: Try to get around the $.fn.animate issue while testing
QUnit.skip(
	'should fade in after open() call',
	function(assert) {
		this.view.render();
		this.view.open();

		assert.equal(this.root.find('.clickblocker').css('opacity'), '0');

		this.sandbox.clock.tick(1);
		assert.notEqual(this.root.find('.clickblocker').css('opacity'), '0');
		assert.notEqual(this.root.find('.clickblocker').css('opacity'), '1');

		this.sandbox.clock.tick(300);
		assert.equal(this.root.find('.clickblocker').css('opacity'), '1');
	}
);

// TODO: Try to get around the $.fn.animate issue while testing
QUnit.skip(
	'should out after close() call',
	function(assert) {
		this.view.render();
		this.view.open();

		this.sandbox.clock.tick(300);
		this.view.close();
		this.sandbox.clock.tick(300);

		assert.equal(this.root.find('.clickblocker').css('opacity'), '0');
		assert.equal(this.root.find('.clickblocker').length, 1);
	}
);

// TODO: Try to get around the $.fn.animate issue while testing
QUnit.skip(
	'should remove after destroy()',
	function(assert) {
		this.view.render();
		this.view.open();

		this.sandbox.clock.tick(300);
		this.view.destroy();
		this.sandbox.clock.tick(300);

		assert.equal(this.root.find('.clickblocker').css('opacity'), '0');
		assert.equal(this.root.find('.clickblocker').length, 0);
	}
);
