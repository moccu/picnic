/* global QUnit, sinon */
import $ from 'jquery';
import _ from 'underscore';
import Geppetto from 'backbone.geppetto';
import Service from 'picnic/tracking-outbound/services/Outbound';


QUnit.module('The tracking-outbound service', {
	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.context = new Geppetto.Context();
	},

	afterEach: function() {
		this.root.off('click');
		$('body').off('click');
	}
});

QUnit.test(
	'should fail on instantiation when no context is given',
	function(assert) {
		assert.throws(function() {
			new Service();
		});
	}
);

QUnit.test(
	'should initialize correctly when all required options are given',
	function(assert) {
		new Service({context: this.context});
		assert.ok(true);
	}
);

QUnit.test(
	'should register listener for outbound events on root element',
	function(assert) {
		new Service({context: this.context, root: 'body'});
		assert.equal($._data(document.body, 'events').click.length, 1);

		new Service({context: this.context, root: this.root});
		assert.equal($._data(document.body, 'events').click.length, 1);
		assert.equal($._data(this.root[0], 'events').click.length, 1);
	}
);

function testLinks(assert, links, callback, eventName, scope) {
	var
		parent = $('<div />').appendTo(scope.root),
		button = $('<a href="#">Click me</a>').on('click', function(event) {
			event.preventDefault();
		}).appendTo(parent)
	;

	// Wire callback function to handle events...
	scope.context.vent.on(eventName, callback);

	// Build link with each combination of href and trigger a click on it...
	_.each(links, function(link) {
		parent
			.attr('class', link.parentClazz ? link.parentClazz : '');

		button
			.attr('href', link.href)
			.trigger(new $.Event('click'));
	});

	// Validate calls:
	_.each(callback.getCalls(), function(call) {
		// Find link definition according current call
		var
			allowed = _.where(links, {triggers: true, href: call.args[0].label}),
			disallowed = _.where(links, {triggers: false, href: call.args[0].label})
		;

		// Expect allowed links to be 1 and disallowed links to be 0...
		assert.ok(allowed.length === 1, 'The link "' + call.args[0].label + '" was accidentally not tracked as outbound');
		assert.ok(disallowed.length === 0, 'The link "' + call.args[0].label + '" was accidentally trigger as outbound');

		// Remove found links from link list to not validate them twice...
		if (allowed.length === 1) { links = _.without(links, allowed[0]); }
		if (disallowed.length === 1) { links = _.without(links, disallowed[0]); }
	});

	// Validate left links, ensure that they are all type of "triggers: false"
	_.each(links, function(link) {
		assert.ok(
			link.triggers === false,
			// Error message:
			'The link "' + link.href + '" was accidentally not tracked as outbound'
		);
	});
}

QUnit.test(
	'should handle events correctly with default settings',
	function(assert) {
		var
			eventName = 'foo:bar',
			callback = sinon.spy(),
			links = [
				// Locals
				{triggers: false, href: '/'},
				{triggers: false, href: '/baz'},
				{triggers: false, href: '/baz/'},
				{triggers: false, href: '/baz/omg'},
				{triggers: false, href: '/baz/omg.html'},

				// Current location:
				{triggers: false, href: 'http://' + window.location.hostname + ''},
				{triggers: false, href: 'http://' + window.location.hostname + '/'},
				{triggers: false, href: 'http://' + window.location.hostname + '/foo'},
				{triggers: false, href: 'http://' + window.location.hostname + '/foo/'},
				{triggers: false, href: 'http://' + window.location.hostname + '/foo/omg'},
				{triggers: false, href: 'http://' + window.location.hostname + '/foo/omg.html'},
				{triggers: false, href: 'https://' + window.location.hostname + ''},
				{triggers: false, href: 'https://' + window.location.hostname + '/'},
				{triggers: false, href: 'https://' + window.location.hostname + '/foo'},
				{triggers: false, href: 'https://' + window.location.hostname + '/foo/'},
				{triggers: false, href: 'https://' + window.location.hostname + '/foo/omg'},
				{triggers: false, href: 'https://' + window.location.hostname + '/foo/omg.html'},
				{triggers: false, href: 'http://www.' + window.location.hostname + ''},
				{triggers: false, href: 'http://www.' + window.location.hostname + '/'},
				{triggers: false, href: 'http://www.' + window.location.hostname + '/foo'},
				{triggers: false, href: 'http://www.' + window.location.hostname + '/foo/'},
				{triggers: false, href: 'http://www.' + window.location.hostname + '/foo/omg'},
				{triggers: false, href: 'http://www.' + window.location.hostname + '/foo/omg.html'},
				{triggers: false, href: 'https://www.' + window.location.hostname + ''},
				{triggers: false, href: 'https://www.' + window.location.hostname + '/'},
				{triggers: false, href: 'https://www.' + window.location.hostname + '/foo'},
				{triggers: false, href: 'https://www.' + window.location.hostname + '/foo/'},
				{triggers: false, href: 'https://www.' + window.location.hostname + '/foo/omg'},
				{triggers: false, href: 'https://www.' + window.location.hostname + '/foo/omg.html'},
				{triggers: false, href: 'http://subdomain.' + window.location.hostname + ''},
				{triggers: false, href: 'http://subdomain.' + window.location.hostname + '/'},
				{triggers: false, href: 'http://subdomain.' + window.location.hostname + '/foo'},
				{triggers: false, href: 'http://subdomain.' + window.location.hostname + '/foo/'},
				{triggers: false, href: 'http://subdomain.' + window.location.hostname + '/foo/omg'},
				{triggers: false, href: 'http://subdomain.' + window.location.hostname + '/foo/omg.html'},
				{triggers: false, href: 'https://subdomain.' + window.location.hostname + ''},
				{triggers: false, href: 'https://subdomain.' + window.location.hostname + '/'},
				{triggers: false, href: 'https://subdomain.' + window.location.hostname + '/foo'},
				{triggers: false, href: 'https://subdomain.' + window.location.hostname + '/foo/'},
				{triggers: false, href: 'https://subdomain.' + window.location.hostname + '/foo/omg'},
				{triggers: false, href: 'https://subdomain.' + window.location.hostname + '/foo/omg.html'},

				// Links without matching selector:
				{triggers: false, href: 'http://www.youtube.com/watch?v=WaAayq_Y-9o', parentClazz: 'foobar'},
				{triggers: false, href: 'https://www.youtube.com/watch?v=WaAayq_Y-9o', parentClazz: 'foobar'},

				// Outbound:
				{triggers: true, href: 'http://foo.bar'},
				{triggers: true, href: 'http://foo.bar/'},
				{triggers: true, href: 'http://foo.bar/baz'},
				{triggers: true, href: 'http://foo.bar/baz/'},
				{triggers: true, href: 'http://foo.bar/baz/omg'},
				{triggers: true, href: 'http://foo.bar/baz/omg.html'},
				{triggers: true, href: 'https://foo.bar'},
				{triggers: true, href: 'https://foo.bar/'},
				{triggers: true, href: 'https://foo.bar/baz'},
				{triggers: true, href: 'https://foo.bar/baz/'},
				{triggers: true, href: 'https://foo.bar/baz/omg'},
				{triggers: true, href: 'https://foo.bar/baz/omg.html'},
				{triggers: true, href: 'http://www.foo.bar'},
				{triggers: true, href: 'http://www.foo.bar/'},
				{triggers: true, href: 'http://www.foo.bar/baz'},
				{triggers: true, href: 'http://www.foo.bar/baz/'},
				{triggers: true, href: 'http://www.foo.bar/baz/omg'},
				{triggers: true, href: 'http://www.foo.bar/baz/omg.html'},
				{triggers: true, href: 'https://www.foo.bar'},
				{triggers: true, href: 'https://www.foo.bar/'},
				{triggers: true, href: 'https://www.foo.bar/baz'},
				{triggers: true, href: 'https://www.foo.bar/baz/'},
				{triggers: true, href: 'https://www.foo.bar/baz/omg'},
				{triggers: true, href: 'https://www.foo.bar/baz/omg.html'},
				{triggers: true, href: 'http://subdomain.foo.bar'},
				{triggers: true, href: 'http://subdomain.foo.bar/'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz/'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz/omg'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz/omg.html'},
				{triggers: true, href: 'https://subdomain.foo.bar'},
				{triggers: true, href: 'https://subdomain.foo.bar/'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz/'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz/omg'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz/omg.html'},
				{triggers: true, href: '//foo.bar'},
				{triggers: true, href: '//foo.bar/'},
				{triggers: true, href: '//foo.bar/baz'},
				{triggers: true, href: '//foo.bar/baz/'},
				{triggers: true, href: '//foo.bar/baz/omg'},
				{triggers: true, href: '//foo.bar/baz/omg.html'},
				{triggers: true, href: '//www.foo.bar'},
				{triggers: true, href: '//www.foo.bar/'},
				{triggers: true, href: '//www.foo.bar/baz'},
				{triggers: true, href: '//www.foo.bar/baz/'},
				{triggers: true, href: '//www.foo.bar/baz/omg'},
				{triggers: true, href: '//www.foo.bar/baz/omg.html'},
				{triggers: true, href: '//subdomain.foo.bar'},
				{triggers: true, href: '//subdomain.foo.bar/'},
				{triggers: true, href: '//subdomain.foo.bar/baz'},
				{triggers: true, href: '//subdomain.foo.bar/baz/'},
				{triggers: true, href: '//subdomain.foo.bar/baz/omg'},
				{triggers: true, href: '//subdomain.foo.bar/baz/omg.html'}
			]
		;

		// Create service...
		new Service({
			context: this.context,
			root: 'body',
			selector: 'a:not(.foobar a)',
			eventName: eventName,
			eventData: {
				foo: 'foo',
				bar: 'bar'
			}
		});

		testLinks(assert, links, callback, eventName, this);
	}
);

QUnit.test(
	'should handle events correctly with custom regexp settings',
	function(assert) {
		var
			eventName = 'foo:bar',
			callback = sinon.spy(),
			links = [
				// Locals
				{triggers: false, href: '/'},
				{triggers: false, href: '/baz'},
				{triggers: false, href: '/baz/'},
				{triggers: false, href: '/baz/omg'},
				{triggers: false, href: '/baz/omg.html'},

				// fake-domain.com (is defined as current domain, no outbound)
				{triggers: false, href: 'http://fake-domain.com'},
				{triggers: false, href: 'http://fake-domain.com/'},
				{triggers: false, href: 'http://fake-domain.com/foo'},
				{triggers: false, href: 'http://fake-domain.com/foo/'},
				{triggers: false, href: 'http://fake-domain.com/foo/omg'},
				{triggers: false, href: 'http://fake-domain.com/foo/omg.html'},
				{triggers: false, href: 'https://fake-domain.com'},
				{triggers: false, href: 'https://fake-domain.com/'},
				{triggers: false, href: 'https://fake-domain.com/foo'},
				{triggers: false, href: 'https://fake-domain.com/foo/'},
				{triggers: false, href: 'https://fake-domain.com/foo/omg'},
				{triggers: false, href: 'https://fake-domain.com/foo/omg.html'},
				{triggers: false, href: 'http://www.fake-domain.com'},
				{triggers: false, href: 'http://www.fake-domain.com/'},
				{triggers: false, href: 'http://www.fake-domain.com/foo'},
				{triggers: false, href: 'http://www.fake-domain.com/foo/'},
				{triggers: false, href: 'http://www.fake-domain.com/foo/omg'},
				{triggers: false, href: 'http://www.fake-domain.com/foo/omg.html'},
				{triggers: false, href: 'https://www.fake-domain.com'},
				{triggers: false, href: 'https://www.fake-domain.com/'},
				{triggers: false, href: 'https://www.fake-domain.com/foo'},
				{triggers: false, href: 'https://www.fake-domain.com/foo/'},
				{triggers: false, href: 'https://www.fake-domain.com/foo/omg'},
				{triggers: false, href: 'https://www.fake-domain.com/foo/omg.html'},
				{triggers: false, href: 'http://subdomain.fake-domain.com'},
				{triggers: false, href: 'http://subdomain.fake-domain.com/'},
				{triggers: false, href: 'http://subdomain.fake-domain.com/foo'},
				{triggers: false, href: 'http://subdomain.fake-domain.com/foo/'},
				{triggers: false, href: 'http://subdomain.fake-domain.com/foo/omg'},
				{triggers: false, href: 'http://subdomain.fake-domain.com/foo/omg.html'},
				{triggers: false, href: 'https://subdomain.fake-domain.com'},
				{triggers: false, href: 'https://subdomain.fake-domain.com/'},
				{triggers: false, href: 'https://subdomain.fake-domain.com/foo'},
				{triggers: false, href: 'https://subdomain.fake-domain.com/foo/'},
				{triggers: false, href: 'https://subdomain.fake-domain.com/foo/omg'},
				{triggers: false, href: 'https://subdomain.fake-domain.com/foo/omg.html'},

				// Links without matching selector:
				{triggers: false, href: 'http://www.youtube.com/watch?v=WaAayq_Y-9o', parentClazz: 'foobar'},
				{triggers: false, href: 'https://www.youtube.com/watch?v=WaAayq_Y-9o', parentClazz: 'foobar'},

				// Outbound: window.location.hostname (should trigger as outbound in this test case):
				{triggers: true, href: 'http://' + window.location.hostname + ''},
				{triggers: true, href: 'http://' + window.location.hostname + '/'},
				{triggers: true, href: 'http://' + window.location.hostname + '/foo'},
				{triggers: true, href: 'http://' + window.location.hostname + '/foo/'},
				{triggers: true, href: 'http://' + window.location.hostname + '/foo/omg'},
				{triggers: true, href: 'http://' + window.location.hostname + '/foo/omg.html'},
				{triggers: true, href: 'https://' + window.location.hostname + ''},
				{triggers: true, href: 'https://' + window.location.hostname + '/'},
				{triggers: true, href: 'https://' + window.location.hostname + '/foo'},
				{triggers: true, href: 'https://' + window.location.hostname + '/foo/'},
				{triggers: true, href: 'https://' + window.location.hostname + '/foo/omg'},
				{triggers: true, href: 'https://' + window.location.hostname + '/foo/omg.html'},
				{triggers: true, href: 'http://www.' + window.location.hostname + ''},
				{triggers: true, href: 'http://www.' + window.location.hostname + '/'},
				{triggers: true, href: 'http://www.' + window.location.hostname + '/foo'},
				{triggers: true, href: 'http://www.' + window.location.hostname + '/foo/'},
				{triggers: true, href: 'http://www.' + window.location.hostname + '/foo/omg'},
				{triggers: true, href: 'http://www.' + window.location.hostname + '/foo/omg.html'},
				{triggers: true, href: 'https://www.' + window.location.hostname + ''},
				{triggers: true, href: 'https://www.' + window.location.hostname + '/'},
				{triggers: true, href: 'https://www.' + window.location.hostname + '/foo'},
				{triggers: true, href: 'https://www.' + window.location.hostname + '/foo/'},
				{triggers: true, href: 'https://www.' + window.location.hostname + '/foo/omg'},
				{triggers: true, href: 'https://www.' + window.location.hostname + '/foo/omg.html'},
				{triggers: true, href: 'http://subdomain.' + window.location.hostname + ''},
				{triggers: true, href: 'http://subdomain.' + window.location.hostname + '/'},
				{triggers: true, href: 'http://subdomain.' + window.location.hostname + '/foo'},
				{triggers: true, href: 'http://subdomain.' + window.location.hostname + '/foo/'},
				{triggers: true, href: 'http://subdomain.' + window.location.hostname + '/foo/omg'},
				{triggers: true, href: 'http://subdomain.' + window.location.hostname + '/foo/omg.html'},
				{triggers: true, href: 'https://subdomain.' + window.location.hostname + ''},
				{triggers: true, href: 'https://subdomain.' + window.location.hostname + '/'},
				{triggers: true, href: 'https://subdomain.' + window.location.hostname + '/foo'},
				{triggers: true, href: 'https://subdomain.' + window.location.hostname + '/foo/'},
				{triggers: true, href: 'https://subdomain.' + window.location.hostname + '/foo/omg'},
				{triggers: true, href: 'https://subdomain.' + window.location.hostname + '/foo/omg.html'},

				// Outbound:
				{triggers: true, href: 'http://foo.bar'},
				{triggers: true, href: 'http://foo.bar/'},
				{triggers: true, href: 'http://foo.bar/baz'},
				{triggers: true, href: 'http://foo.bar/baz/'},
				{triggers: true, href: 'http://foo.bar/baz/omg'},
				{triggers: true, href: 'http://foo.bar/baz/omg.html'},
				{triggers: true, href: 'https://foo.bar'},
				{triggers: true, href: 'https://foo.bar/'},
				{triggers: true, href: 'https://foo.bar/baz'},
				{triggers: true, href: 'https://foo.bar/baz/'},
				{triggers: true, href: 'https://foo.bar/baz/omg'},
				{triggers: true, href: 'https://foo.bar/baz/omg.html'},
				{triggers: true, href: 'http://www.foo.bar'},
				{triggers: true, href: 'http://www.foo.bar/'},
				{triggers: true, href: 'http://www.foo.bar/baz'},
				{triggers: true, href: 'http://www.foo.bar/baz/'},
				{triggers: true, href: 'http://www.foo.bar/baz/omg'},
				{triggers: true, href: 'http://www.foo.bar/baz/omg.html'},
				{triggers: true, href: 'https://www.foo.bar'},
				{triggers: true, href: 'https://www.foo.bar/'},
				{triggers: true, href: 'https://www.foo.bar/baz'},
				{triggers: true, href: 'https://www.foo.bar/baz/'},
				{triggers: true, href: 'https://www.foo.bar/baz/omg'},
				{triggers: true, href: 'https://www.foo.bar/baz/omg.html'},
				{triggers: true, href: 'http://subdomain.foo.bar'},
				{triggers: true, href: 'http://subdomain.foo.bar/'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz/'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz/omg'},
				{triggers: true, href: 'http://subdomain.foo.bar/baz/omg.html'},
				{triggers: true, href: 'https://subdomain.foo.bar'},
				{triggers: true, href: 'https://subdomain.foo.bar/'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz/'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz/omg'},
				{triggers: true, href: 'https://subdomain.foo.bar/baz/omg.html'},
				{triggers: true, href: '//foo.bar'},
				{triggers: true, href: '//foo.bar/'},
				{triggers: true, href: '//foo.bar/baz'},
				{triggers: true, href: '//foo.bar/baz/'},
				{triggers: true, href: '//foo.bar/baz/omg'},
				{triggers: true, href: '//foo.bar/baz/omg.html'},
				{triggers: true, href: '//www.foo.bar'},
				{triggers: true, href: '//www.foo.bar/'},
				{triggers: true, href: '//www.foo.bar/baz'},
				{triggers: true, href: '//www.foo.bar/baz/'},
				{triggers: true, href: '//www.foo.bar/baz/omg'},
				{triggers: true, href: '//www.foo.bar/baz/omg.html'},
				{triggers: true, href: '//subdomain.foo.bar'},
				{triggers: true, href: '//subdomain.foo.bar/'},
				{triggers: true, href: '//subdomain.foo.bar/baz'},
				{triggers: true, href: '//subdomain.foo.bar/baz/'},
				{triggers: true, href: '//subdomain.foo.bar/baz/omg'},
				{triggers: true, href: '//subdomain.foo.bar/baz/omg.html'}
			]
		;

		// Create service...
		new Service({
			context: this.context,
			root: 'body',
			selector: 'a:not(.foobar a)',
			regexDomain: /^(https?:)?\/\/[^/]*\.?fake\-domain\.com(\/)?/i,
			eventName: eventName,
			eventData: {
				foo: 'foo',
				bar: 'bar'
			}
		});

		testLinks(assert, links, callback, eventName, this);
	}
);
