/* global QUnit, sinon */
import  $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/singlepage/commands/Navigate';
import Translate from 'picnic/singlepage/commands/Translate';
import Link from 'picnic/singlepage/utils/Link';


function __response(request, status, response) {
	response = response || '<html><head><title>response</title></head><body><div><div id="main"><div>Some <b>Response</b> HTML</div></div></div></body></html>';
	if (status === 200) {
		request.respond(200, {'Content-Type': 'text/plain'}, response);
	} else {
		request.respond(status, {'Content-Type': 'text/plain'});
	}
}

class CustromTranslateIn extends Translate {
	execute() {
		CustromTranslateIn.called = true;
		CustromTranslateIn.eventData = this.eventData;
		this.done();
	}
}

class CustromTranslateOut extends Translate {
	execute() {
		CustromTranslateOut.called = true;
		CustromTranslateOut.eventData = this.eventData;
		this.done();
	}
}


QUnit.module('The singlepage navigate command', {

	beforeEach: function() {
		sinon.stub(window, 'open', function() {
			return false;
		});

		this._documentTitle = document.title;

		this.root = $('#qunit-fixture').append('<div id="main"></div>');
		this.main = this.root.find('#main');
		this.view = {replace: sinon.spy()};
		this.service = {navigate: sinon.spy()};
		this.context = new Geppetto.Context();
		this.context.wireValue('singlepage:views', [this.view]);
		this.context.wireValue('singlepage:service', this.service);
		this.context.wireValue('singlepage:settings', {
			scriptIds: [
				'configuration',
				'settings'
			],
			styleIds: [
				'layout',
				'inline'
			]
		});
		this.context.wireCommand('singlepage:translate:in', CustromTranslateIn);
		this.context.wireCommand('singlepage:translate:out', CustromTranslateOut);
		this.command = new Command();
		this.command.context = this.context;
		this.command.eventName = 'test:event';
		this.command.eventData = {
			href: 'foo://bar.baz/page-2/'
		};

		// Mock jQuery's load function:
		// Use fake XHR requests...
		this.requests = [];
		this.xhr = sinon.useFakeXMLHttpRequest();
		this.xhr.onCreate = function (req) { this.requests.push(req); }.bind(this);

		// Stop jQuery animations...
		$.fx.off = true;
	},

	afterEach: function() {
		window.open.restore();
		document.title = this._documentTitle;

		// Restore default XHR requests...
		this.xhr.restore();

		// Enable jQuery animations...
		$.fx.off = false;

		// Reset flags of transitions...
		CustromTranslateIn.called = false;
		CustromTranslateIn.eventData = undefined;
		CustromTranslateOut.called = false;
		CustromTranslateOut.eventData = undefined;
	}

});

QUnit.test(
	'should request url',
	function(assert) {
		this.command.execute();
		assert.equal(this.requests.length, 1);
		assert.equal(this.requests[0].url, 'foo://bar.baz/page-2/');
	}
);

QUnit.test(
	'should request url with path and selector',
	function(assert) {
		this.command.execute();
		assert.equal(this.requests[0].url, 'foo://bar.baz/page-2/');
	}
);

QUnit.test(
	'should load scripts from response',
	function(assert) {
		var
			response = '<html><head></head><body><div><div id="main"><div>Response</div></div></div><script id="configuration" type="text/javascript">window.foo=\'bar\';</script><script id="settings" type="text/javascript">window.settings={bar: \'bar\'};</script></body></html>'
		;

		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200, response);

		assert.equal(window.foo, 'bar');
		assert.deepEqual(window.settings, {bar: 'bar'});

		delete(window.foo);
		delete(window.settings);
	}
);

QUnit.test(
	'should load styles from response',
	function(assert) {
		var
			response = '<html><head><link id="layout" rel="stylesheet" type="text/css" href="test.css"></head><body><div><div id="main"><div>Response</div></div></div><style id="inline" type="text/css">p {display: block;}</style></body></html>'
		;

		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200, response);

		assert.equal($('#layout')[0].tagName.toLowerCase(), 'link');
		assert.equal($('#layout').parent()[0], document.head);
		assert.equal($('#inline')[0].tagName.toLowerCase(), 'style');
		assert.equal($('#inline').parent()[0], document.head);
	}
);

QUnit.test(
	'should pass content and title into service',
	function(assert) {
		var
			title = Date.now() + '-Title',
			response = '<html><head><title>' + title + '</title></head><body><div><div id="main"><div>Some <b id="deeplink" style="margin-top: 3000px; padding-bottom: 3000px; display: block;">Response</b> HTML</div></div></div></body></html>'
		;

		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200, response);

		assert.ok(this.service.navigate.calledOnce);
		assert.equal(this.service.navigate.getCall(0).args[0], 'foo://bar.baz/page-2/');
		assert.equal(this.service.navigate.getCall(0).args[1], title);
	}
);

QUnit.test(
	'should not pass content and title into service when keepState was set in eventData',
	function(assert) {
		var
			title = Date.now() + '-Title',
			response = '<html><head><title>' + title + '</title></head><body><div><div id="main"><div>Some <b id="deeplink" style="margin-top: 3000px; padding-bottom: 3000px; display: block;">Response</b> HTML</div></div></div></body></html>'
		;

		this.command.eventData.keepState = true;
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200, response);

		assert.ok(this.service.navigate.notCalled);
		assert.equal(document.title, title);
	}
);

QUnit.test(
	'should fire "singlepage:translate:in" event',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('singlepage:translate:in', callback);
		this.command.execute();

		assert.ok(callback.calledOnce);
	}
);

QUnit.test(
	'should fire "singlepage:translate:out" event on successful response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('singlepage:translate:out', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.ok(callback.calledOnce);
	}
);

QUnit.test(
	'should fire "singlepage:translate:out" event on failed response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('singlepage:translate:out', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 404);

		assert.ok(callback.calledOnce);
	}
);

QUnit.test(
	'should fire "application:stop" event on successful response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('application:stop', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0].root[0], $('#main')[0]);
	}
);

QUnit.test(
	'should fire "application:start" event on successful response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('application:start', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0].root[0], $('#main')[0]);
	}
);

QUnit.test(
	'should fire events in expected order on successful response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('test:event:init', callback);
		this.context.vent.on('singlepage:translate:in', callback);
		this.context.vent.on('test:event:fail', callback);
		this.context.vent.on('test:event:start', callback);
		this.context.vent.on('application:stop', callback);
		this.context.vent.on('application:start', callback);
		this.context.vent.on('test:event:end', callback);
		this.context.vent.on('singlepage:translate:out', callback);
		this.context.vent.on('test:event:done', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.equal(callback.getCall(0).args[0].eventName, 'test:event:init');
		assert.equal(callback.getCall(1).args[0].eventName, 'singlepage:translate:in');
		assert.equal(callback.getCall(2).args[0].eventName, 'test:event:start');
		assert.equal(callback.getCall(3).args[0].eventName, 'application:stop');
		assert.equal(callback.getCall(4).args[0].eventName, 'application:start');
		assert.equal(callback.getCall(5).args[0].eventName, 'test:event:end');
		assert.equal(callback.getCall(6).args[0].eventName, 'singlepage:translate:out');
		assert.equal(callback.getCall(7).args[0].eventName, 'test:event:done');
		assert.equal(callback.callCount, 8);
	}
);

QUnit.test(
	'should fire events in expected order on failed response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('test:event:init', callback);
		this.context.vent.on('singlepage:translate:in', callback);
		this.context.vent.on('test:event:fail', callback);
		this.context.vent.on('test:event:start', callback);
		this.context.vent.on('application:stop', callback);
		this.context.vent.on('application:start', callback);
		this.context.vent.on('test:event:end', callback);
		this.context.vent.on('singlepage:translate:out', callback);
		this.context.vent.on('test:event:done', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 500);

		assert.equal(callback.getCall(0).args[0].eventName, 'test:event:init');
		assert.equal(callback.getCall(1).args[0].eventName, 'singlepage:translate:in');
		assert.equal(callback.getCall(2).args[0].eventName, 'test:event:fail');
		assert.equal(callback.getCall(3).args[0].eventName, 'singlepage:translate:out');
		assert.equal(callback.getCall(4).args[0].eventName, 'test:event:done');
		assert.equal(callback.callCount, 5);
	}
);

QUnit.test(
	'should send title with "*:start" and "*:end" events',
	function(assert) {
		var
			title = Date.now() + '-Title',
			response = '<html><head><title>' + title + '</title></head><body><div><div id="main"><div>Some <b id="deeplink" style="margin-top: 3000px; padding-bottom: 3000px; display: block;">Response</b> HTML</div></div></div></body></html>',
			callback = sinon.spy()
		;

		this.context.vent.on('test:event:start', callback);
		this.context.vent.on('test:event:end', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200, response);

		assert.deepEqual(
			callback.getCall(0).args[0],
			{
				href: 'foo://bar.baz/page-2/',
				title: title,
				eventName: 'test:event:start'
			}
		);

		assert.deepEqual(
			callback.getCall(1).args[0],
			{
				href: 'foo://bar.baz/page-2/',
				title: title,
				eventName: 'test:event:end'
			}
		);
	}
);

QUnit.test(
	'should replace contents in singlepage view on successfull response',
	function(assert) {
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.ok(this.view.replace.calledOnce);
		assert.equal(
			this.view.replace.getCall(0).args[0].get(0).outerHTML,
			'<div>Some <b>Response</b> HTML</div>'
		);
	}
);

QUnit.test(
	'should not replace contents in singlepage view on failed response',
	function(assert) {
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 404);

		assert.ok(this.view.replace.notCalled);
	}
);

QUnit.test(
	'should remove deeplink from xhr request',
	function(assert) {
		var href = this.command.eventData.href;
		this.command.eventData.href = href + '#deeplink';
		this.command.execute();

		assert.equal(this.requests[0].url, href);
	}
);

QUnit.test(
	'should use custom transitions',
	function(assert) {
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.ok(CustromTranslateIn.called);
		assert.ok(CustromTranslateOut.called);
	}
);

QUnit.test(
	'should pass data into transitions',
	function(assert) {
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.ok(CustromTranslateIn.eventData.link instanceof Link);
		assert.equal(CustromTranslateIn.eventData.link.href, 'foo://bar.baz/page-2/');
		assert.equal(CustromTranslateIn.eventData.title, document.title);
		assert.equal(CustromTranslateIn.eventData.direction, 'forward');
		assert.equal(CustromTranslateIn.eventData.translate, 'in');

		assert.ok(CustromTranslateOut.eventData.link instanceof Link);
		assert.equal(CustromTranslateOut.eventData.link.href, 'foo://bar.baz/page-2/');
		assert.equal(CustromTranslateOut.eventData.title, 'response');
		assert.equal(CustromTranslateOut.eventData.direction, 'forward');
		assert.equal(CustromTranslateOut.eventData.translate, 'out');
	}
);

QUnit.test(
	'should pass "forward" direction into transitions',
	function(assert) {
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.equal(CustromTranslateIn.eventData.direction, 'forward');
		assert.equal(CustromTranslateOut.eventData.direction, 'forward');
	}
);


QUnit.test(
	'should pass direction depending on event\'s direction into transitions',
	function(assert) {
		this.command.eventData.direction = 1;
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.equal(CustromTranslateIn.eventData.direction, 'forward');
		assert.equal(CustromTranslateOut.eventData.direction, 'forward');

		this.command.eventData.direction = -1;
		this.command.execute();

		// Trigger response...
		__response(this.requests[1], 200);

		assert.equal(CustromTranslateIn.eventData.direction, 'backward');
		assert.equal(CustromTranslateOut.eventData.direction, 'backward');

	}
);
