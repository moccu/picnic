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

var IntersectionObserverRestore = window.IntersectionObserver;


function __mockIntersectionObserver(scope) {
	window.IntersectionObserver = class IntersectionObserverMock {
		constructor(callback, options) {
			this.callback = callback;
			this.options = options;
			scope.intersectionObserver = this;
		}

		observe(el) {
			this.el = el;
		}

		threshold(value) {
			this.callback.call(null, [{target: this.el, intersectionRatio: value}]);
		}
	};
}

function __removeIntersectionObserver() {
	window.IntersectionObserver = undefined;
}

function __restoreIntersectionObserver() {
	window.IntersectionObserver = IntersectionObserverRestore;
}

QUnit.module('The visibility view mixin', {

	beforeEach: function() {
		__removeIntersectionObserver();

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

		__restoreIntersectionObserver();
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

QUnit.test(
	'should create intersection observer if available',
	function(assert) {
		__mockIntersectionObserver(this);

		this.instance.render();
		assert.ok(this.intersectionObserver instanceof window.IntersectionObserver);
		assert.ok(typeof this.intersectionObserver.callback === 'function');
		assert.deepEqual(this.intersectionObserver.options, {
			rootMargin: '0px',
			threshold: [0]
		});
	}
);

QUnit.test(
	'should observe element using intersection observer if available',
	function(assert) {
		__mockIntersectionObserver(this);

		this.instance.render();
		assert.equal(this.intersectionObserver.el, this.instance.el);
	}
);

QUnit.test(
	'should handle scroll using intersection observer if available',
	function(assert) {
		__mockIntersectionObserver(this);

		var
			$window = $(window),
			onVisible = sinon.spy(),
			onInvisible = sinon.spy()
		;

		this.instance.render()
			.on('visibility:visible', onVisible)
			.on('visibility:invisible', onInvisible);

		$window.scrollTop($window.height() - 1);
		this.intersectionObserver.threshold(0);
		assert.ok(onVisible.notCalled);
		assert.ok(onInvisible.notCalled);

		$window.scrollTop($window.height());
		this.intersectionObserver.threshold(0.1);
		assert.ok(onVisible.calledOnce);
		assert.ok(onInvisible.notCalled);

		$window.scrollTop($window.height() * 3);
		this.intersectionObserver.threshold(0.1);
		assert.ok(onVisible.calledOnce);
		assert.ok(onInvisible.notCalled);

		$window.scrollTop($window.height() * 3 + 1);
		this.intersectionObserver.threshold(0);
		assert.ok(onVisible.calledOnce);
		assert.ok(onInvisible.calledOnce);
	}
);

QUnit.test(
	'should be invisible when not attached to DOM',
	function(assert) {
		// Bring in viewport, theoretical...
		var $window = $(window);
		$window.scrollTop($window.height());

		this.instance.$el.remove();
		this.instance.render();
		assert.notOk(this.instance.isVisible());

		this.instance.$el.appendTo(this.root);
		assert.ok(this.instance.isVisible());
	}
);
