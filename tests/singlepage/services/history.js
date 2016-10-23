/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Service from 'picnic/singlepage/services/History';


class MockHistory {
	constructor() {
		$.extend(this, {
			replaceState: sinon.spy(),
			pushState: sinon.spy(),
			forward: sinon.spy(),
			back: sinon.spy(),
			go: sinon.spy()
		});
	}
}

class MockDocument {
	constructor() { this._title = 'not set'; }
	get title() { return this._title; }
	set title(value) { this._title = value; }
}


QUnit.module('The singlepage history service', {

	beforeEach: function() {
		this.api = new MockHistory();
		this.location = {};

		this.context = new Geppetto.Context();
		this.options = {
			context: this.context,
			eventName: 'test:event',
			apiname: 'api',
			global: this,
			document: new MockDocument()
		};

		this.service = new Service(this.options);
	},

	afterEach: function() {
		$(window).off('popstate');
	}

});

QUnit.test(
	'should replace history when instantiate service',
	function(assert) {
		assert.ok(this.api.replaceState.calledOnce);
		assert.deepEqual(this.api.replaceState.getCall(0).args[0], {
			href: window.location.href,
			index: 0
		}, 'stores current location');
		assert.equal(this.api.replaceState.getCall(0).args[1], undefined, 'sets no title');
		assert.equal(this.api.replaceState.getCall(0).args[2], window.location.href, 'navigates to current location');
		assert.equal(this.options.document.title, 'not set', 'sets no title');
	}
);

QUnit.test(
	'should change browsers history when calling navigate()',
	function(assert) {
		var href = window.location.protocol + '//' +
			window.location.hostname +
			(window.location.port ? ':' + window.location.port : '') +
			'/foo/bar/'
		;

		this.service.navigate('/foo/bar/', 'Baz');
		assert.ok(this.api.pushState.calledOnce);
		assert.deepEqual(this.api.pushState.getCall(0).args[0], {
			href: href,
			index: 1
		}, 'stores given location');
		assert.equal(this.api.pushState.getCall(0).args[1], 'Baz', 'sets given title');
		assert.equal(this.api.pushState.getCall(0).args[2], href, 'navigates to given location');
		assert.equal(this.options.document.title, 'Baz', 'sets given title');
	}
);

QUnit.test(
	'should handle popstate events on global object and notify to navigate in singlepage app',
	function(assert) {
		var
			callback = sinon.spy(),
			fakePopStateEvent = {
				state: {
					href: '/foo/bar/',
					index: 2
				},
				type: 'popstate'
			}
		;

		this.context.vent.on('test:event', callback);

		// Trigger browser history change by 'popstate'...
		$(this).trigger($.Event('popstate', {originalEvent: fakePopStateEvent}));

		assert.ok(callback.calledOnce);
		assert.deepEqual(callback.getCall(0).args[0],{
			eventName: 'test:event',
			href: '/foo/bar/',
			direction: 2,
			keepState: true
		});
	}
);

QUnit.test('should handle exceptions when replaceState fails', function(assert) {
	this.api.replaceState = function() {
		throw new Error('replaceState exception');
	};

	new Service(this.options);
	assert.ok(true);
});

QUnit.test('should navigate with pagereload when replaceState failed before', function(assert) {
	this.api.replaceState = function() {
		throw new Error('replaceState exception');
	};

	var
		service = new Service(this.options),
		domain = window.location.protocol + '//' +
				window.location.hostname +
				(window.location.port ? ':' + window.location.port : '')
	;

	service.navigate('/foo/bar/', 'Baz');
	assert.deepEqual(this.location, {href: domain + '/foo/bar/'});
});

QUnit.test('should navigate with pagereload when pushState fails', function(assert) {
	this.api.pushState = function() {
		throw new Error('pushState exception');
	};

	var
		service = new Service(this.options),
		domain = window.location.protocol + '//' +
				window.location.hostname +
				(window.location.port ? ':' + window.location.port : '')
	;

	service.navigate('/foo/bar/', 'Baz');
	assert.deepEqual(this.location, {href: domain + '/foo/bar/'});
});
