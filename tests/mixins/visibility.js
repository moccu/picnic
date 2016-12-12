/* global QUnit, sinon */
import $ from 'jquery';
import Backbone from 'backbone';
import VisibilityMixin from 'picnic/mixins/Visibility';
import Fixture from 'tests/mixins/fixtures/visibility.html!text';


class View extends Backbone.View {

	constructor(options) {
		super(options);

		this.originalRender = sinon.stub(this, 'render');
		this.originalDestroy = sinon.stub(this, 'destroy');

		new VisibilityMixin(this);
	}

	destroy() {

	}

}

class NoView {
	constructor() {
		new VisibilityMixin(this);
	}
}

QUnit.module('The visibility view mixin', {

	beforeEach: function() {
		var height = $(window).height();

		this.root = $('#qunit-fixture').html(Fixture);
		// Set position of fixures root element to be visible:
		this.root.css({
			top: 0,
			left: 0,
			width: '100%',
			height: 'auto',
			paddingTop: height * 2,
			paddingBottom: height * 2
		});
		this.element = $('.element')
			.height(height);
		this.options = {el: this.element};
		this.instance = new View(this.options);
	},

	afterEach: function() {
		this.instance.destroy();

		$(window).scrollTop(0);
		// Reset position of fixures root element:
		this.root.css({
			top: '',
			left: '',
			width: '',
			height: '',
			paddingTop: '',
			paddingBottom: ''
		});
	}

});

QUnit.test('should fail when applied on an non backbone view', function(assert) {
	assert.throws(function() {
		new NoView();
	}, new Error('The visibility mixin needs to be applied on a backbone view instance.'));
});

QUnit.test('should add "isVisible" method to target instance', function(assert) {
	assert.ok(this.instance.isVisible instanceof Function);
});

QUnit.test('should return itself on render() call', function(assert) {
	assert.equal(this.instance.render(), this.instance);
});

QUnit.test('should call original render and pass arguments', function(assert) {
	this.instance.render('foo', 'bar', true, 42);

	assert.ok(this.instance.originalRender.calledOnce);
	assert.deepEqual(this.instance.originalRender.getCall(0).args, ['foo', 'bar', true, 42]);
});

QUnit.test('should call original destroy and pass arguments', function(assert) {
	this.instance.render();
	this.instance.destroy('foo', 'bar', true, 42);

	assert.ok(this.instance.originalDestroy.calledOnce);
	assert.deepEqual(this.instance.originalDestroy.getCall(0).args, ['foo', 'bar', true, 42]);
});

QUnit.test('should initially return to not be visible', function(assert) {
	this.instance.render();
	assert.equal(this.instance.isVisible(), false);
});

QUnit.test('should be visible when element is in viewport', function(assert) {
	var $window = $(window);
	this.instance.render();

	$window.scrollTop($window.height() - 1);
	assert.equal(this.instance.isVisible(), false);

	$window.scrollTop($window.height());
	assert.equal(this.instance.isVisible(), true);

	$window.scrollTop($window.height() * 3);
	assert.equal(this.instance.isVisible(), true);

	$window.scrollTop($window.height() * 3 + 1);
	assert.equal(this.instance.isVisible(), false);
});

QUnit.test('should fire events on scroll', function(assert) {
	var
		$window = $(window),
		onVisible = sinon.spy(),
		onInvisible = sinon.spy()
	;

	this.instance.render()
		.on('visibility:visible', onVisible)
		.on('visibility:invisible', onInvisible);

	$window.scrollTop($window.height() - 1);
	$window.trigger($.Event('scroll'));
	assert.ok(onVisible.notCalled);
	assert.ok(onInvisible.notCalled);

	$window.scrollTop($window.height());
	$window.trigger($.Event('scroll'));
	assert.ok(onVisible.calledOnce);
	assert.ok(onInvisible.notCalled);

	$window.scrollTop($window.height() * 3);
	$window.trigger($.Event('scroll'));
	assert.ok(onVisible.calledOnce);
	assert.ok(onInvisible.notCalled);

	$window.scrollTop($window.height() * 3 + 1);
	$window.trigger($.Event('scroll'));
	assert.ok(onVisible.calledOnce);
	assert.ok(onInvisible.calledOnce);
});
