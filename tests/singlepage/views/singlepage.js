/* global QUnit, sinon */
/*jshint scripturl:true*/
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import View from 'picnic/singlepage/views/Singlepage';
import Fixture from 'tests/singlepage/views/fixtures/singlepage.html!text';


function __createLink(props, target) {
	return $('<a />', props).appendTo(target);
}

function __setLocation(url) {
	window.history.replaceState({}, undefined, url);
}

function __triggerClickEvent(self) {
	var isDefaultPrevented = false;
	self.view.$el.on('click', 'a', function(event) {
		isDefaultPrevented = event.isDefaultPrevented();
		event.preventDefault();
	});
	self.view.$el.find('a').trigger(new $.Event('click'));
	return isDefaultPrevented;
}

function __testNavigation(description, currentLocation, linkLocation, callbackShouldBeCalled, eventShouldBePreventDefaulted, target = '_self') {
	QUnit.test(description, function(assert) {
		var
			isDefaultPrevented = false,
			callback = sinon.spy(),
			link
		;


		this.context.vent.on('test:event', callback);

		__setLocation(currentLocation);
		link = __createLink({href: linkLocation, target: target}, this.element);
		isDefaultPrevented =  __triggerClickEvent(this);

		assert.equal(isDefaultPrevented, eventShouldBePreventDefaulted, eventShouldBePreventDefaulted ? 'it prevents default behaviour' : 'it not prevents default behaviour');
		assert.equal(callback.called, callbackShouldBeCalled, callbackShouldBeCalled ? 'it fires a callback' : 'it not fires a callback');
	});
}

QUnit.module('The singlepage view', {

	beforeEach: function() {
		this.location = window.location.href;
		this.root = $('#qunit-fixture');
		$(Fixture).appendTo(this.root);
		this.element = this.root.find('.singlepage-body').eq(0);
		this.context = new Geppetto.Context();
		this.options = {
			el: this.element,
			context: this.context,
			observeSelector: 'a',
			updateSelector: '#main',
			eventName: 'test:event'
		};
		this.view = new View(this.options);
		this.view.render();
	},

	afterEach: function() {
		// Restore changed location...
		window.history.replaceState({}, undefined, this.location);

		// Remove all events...
		$(window).off('popstate');
	}

});

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);

QUnit.test(
	'should replace content with given content as string',
	function(assert) {
		var
			expected = '<p class="foobar">Lorem Ipsum</p>',
			renderedElement = this.view.options.updateSelector
		;

		this.view.replace(expected);

		assert.equal($(renderedElement).children()[0].outerHTML, expected, 'it equals given content');
	}
);

QUnit.test(
	'should replace content with given content as DOM',
	function(assert) {
		var
			expected = $('<p class="foobar">Lorem Ipsum</p>')[0],
			renderedElement = this.view.options.updateSelector
		;

		this.view.replace(expected);

		assert.equal($(renderedElement).children()[0], expected, 'it equals given content');
	}
);

QUnit.test(
	'should replace content with given content as jQuery',
	function(assert) {
		var
			expected = $('<p class="foobar">Lorem Ipsum</p>'),
			renderedElement = this.view.options.updateSelector
		;

		this.view.replace(expected);

		assert.equal($(renderedElement).children()[0], expected[0], 'it equals given content');
	}
);

QUnit.test(
	'should remove child element before appending',
	function(assert) {
		var
			initElement = $('<div class="foobar"><p>Lorem Ipsum</p></div>'),
			secondElement = $('<div class="baz"><p>Foo Bar</p></div>'),
			renderedElement = this.view.options.updateSelector
		;

		this.view.replace(initElement);
		this.view.replace(secondElement);

		assert.equal($(renderedElement).children()[0].outerHTML, $(secondElement)[0].outerHTML, 'it equals only second given content');
	}
);

QUnit.test(
	'should trigger a download',
	function(assert) {
		var
			isDefaultPrevented = false,
			callback = sinon.spy(),
			link
		;

		this.context.vent.on('test:event', callback);

		__setLocation('/foo/bar#hash');
		link = __createLink({href: '/foo/bar#hash', download: '/foo/bar.html'}, this.element);
		isDefaultPrevented =  __triggerClickEvent(this);

		assert.ok(!(isDefaultPrevented), 'it does not prevent default behaviour');
		assert.ok(callback.notCalled, 'it does not fire a callback');
	}
);


QUnit.test(
	'should trigger a mailto Link',
	function(assert) {
		var
			isDefaultPrevented = false,
			callback = sinon.spy(),
			link
		;

		this.context.vent.on('test:event', callback);

		__setLocation('/foo/bar#hash');
		link = __createLink({href: 'mailto:john.doe@example.com'}, this.element);
		isDefaultPrevented =  __triggerClickEvent(this);

		assert.ok(!(isDefaultPrevented), 'it does not prevent default behaviour');
		assert.ok(callback.notCalled, 'it does not fire a callback');
	}
);

QUnit.test(
	'should trigger a javascript Link',
	function(assert) {
		var
			isDefaultPrevented = false,
			callback = sinon.spy(),
			link
		;

		this.context.vent.on('test:event', callback);

		__setLocation('/foo/bar#hash');
		link = __createLink({href: 'javascript:void(0);'}, this.element);
		isDefaultPrevented =  __triggerClickEvent(this);

		assert.ok(!(isDefaultPrevented), 'it does not prevent default behaviour');
		assert.ok(callback.notCalled, 'it does not fire a callback');
	}
);

__testNavigation(
	'should navigate on page with different path',
	'/foo/', '/bar/',
	true, true
);

__testNavigation(
	'should navigate on page with same path, different search and same hash',
	'/foo/bar?foo=bar#hash', '/foo/bar?lorem=ipsum#hash',
	true, true
);

__testNavigation(
	'should navigage on same page with different path, no search and same hash',
	'/foo/bar?lorem=ipsum#hash', '/bar/foo?foo=bar#hash',
	true, true
);

__testNavigation(
	'should navigate on same page with diffenrent path, same search and same hash',
	'/foo/bar?lorem=ipsum#hash', '/bar/foo?lorem=ipsum#hash',
	true, true
);

__testNavigation(
	'should navigate on same page with different pathname but same search',
	'/foo/bar?foo=bar', '/baz/foo/bar?foo=bar',
	true, true
);

__testNavigation(
	'should navigate on same page with different pathname but same search',
	'/foo/bar?foo=bar', '/baz/foo/bar?bar=foo',
	true, true
);

__testNavigation(
	'should navigate on same page with same pathname but different search',
	'/foo/bar?foo=bar', '/foo/bar?lorem=ipsum',
	true, true
);

__testNavigation(
	'should navigate on same page with different pathname and different search',
	'/foo/bar?foo=bar', '/bar/foo?lorem=ipsum',
	true, true
);

__testNavigation(
	'should not navigate on page with taget: "_blank"',
	'/foo/bar#hash', '/foo/bar#hash',
	false, false,
	'_blank'
);

__testNavigation(
	'should not navigate on page with taget: "_parent"',
	'/foo/bar#hash', '/foo/bar#hash',
	false, false,
	'_parent'
);

__testNavigation(
	'should not navigate on page with taget: "_top"',
	'/foo/bar#hash', '/foo/bar#hash',
	false, false,
	'_top'
);

__testNavigation(
	'should navigate on same page with same pathname but twisted search',
	'/foo/bar?foo=bar&baz=omg', '/foo/bar?baz=omg&foo=bar',
	false, true
);

__testNavigation(
	'should not navigate with the same path, same search and no hash',
	'/foo/bar?foo=bar', '/foo/bar?foo=bar',
	false, true
);

__testNavigation(
	'should not navigate with same path',
	'/foo/', '/foo/',
	false, true
);

__testNavigation(
	'should not navigate with same path, same search and same hash',
	'/foo/bar?foo=bar#hash', '/foo/bar?foo=bar#hash',
	false, true
);

__testNavigation(
	'should not navigate with same path, no search and same hash',
	'/foo/bar#hash', '/foo/bar#hash',
	false, true
);

__testNavigation(
	'should not navigate with same path, same search and different hash',
	'/foo/bar?lorem=ipsum#lorem', '/foo/bar?lorem=ipsum#foobar',
	false, false
);

__testNavigation(
	'should not navigate with same path, same search and different hash',
	'/foo/bar?lorem=ipsum#lorem', '/foo/bar?lorem=ipsum#foobar',
	false, false
);

QUnit.test('should initially have "forceNewWindow" disabled', function(assert) {
	assert.notOk(this.view.options.forceNewWindow);
});

QUnit.test('should open external links in new window when setting "forceNewWindow" option', function(assert) {
	var
		global = {},
		expected = [
			{
				href: 'http://foo.bar/',
				target: '_blank',
				opened: false,
				prevented: false,
				description: 'external link with target blank'
			},
			{
				href: 'http://foo.bar/',
				target: '_self',
				opened: true,
				prevented: true,
				description: 'external link with target self'
			},
			{
				href: '/foo/',
				target: '_self',
				opened: false,
				prevented: true,
				description: 'internal link with target self'
			},
			{
				href: 'javascript:$j.noop();',  // jshint ignore:line
				target: '_self',
				opened: false,
				prevented: true,
				description: 'javascript link'
			}
		],
		isDefaultPrevented,
		link
	;

	this.view.destroy();
	this.view = new View($.extend({
		global: global,
		forceNewWindow: true
	}, this.options));
	this.view.render();

	expected.forEach(function(exp) {
		global.open = sinon.spy();

		link = __createLink(exp, this.element);
		isDefaultPrevented =  __triggerClickEvent(this);

		assert.equal(global.open.calledOnce, exp.opened, exp.description + ' opens in new window');
		assert.equal(isDefaultPrevented, exp.prevented, exp.description + ' is default prevented');

		if (exp.opened) {
			assert.equal(global.open.getCall(0).args[0], exp.href, exp.description + ' navigates to the correct href');
		}

		link.remove();
	}.bind(this));

});
