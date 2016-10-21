/* global QUnit, sinon */
import  $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Command from 'picnic/singlepage/commands/Navigate';


function __response(request, status, response) {
	response = response || '<html><head></head><body><div><div id="main"><div>Some <b>Response</b> HTML</div></div></div></body></html>';
	if (status === 200) {
		request.respond(200, {'Content-Type': 'text/plain'}, response);
	} else {
		request.respond(status, {'Content-Type': 'text/plain'});
	}
}


QUnit.module('The singlepage navigate command', {

	beforeEach: function() {
		window.zdfevent = {isEmbedded: false};
		sinon.stub(window, 'open', function() {
			return false;
		});

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
		this.command = new Command();
		this.command.context = this.context;
		this.command.eventName = 'test:event';
		this.command.eventData = {href: 'foo://bar.baz/page-2/'};

		// Mock jQuery's load function:
		// Use fake XHR requests...
		this.requests = [];
		this.xhr = sinon.useFakeXMLHttpRequest();
		this.xhr.onCreate = function (req) { this.requests.push(req); }.bind(this);

		// Stop jQuery animations...
		$.fx.off = true;
	},

	afterEach: function() {
		window.zdfevent = undefined;
		delete(window.zdfevent);
		window.open.restore();

		// Restore default XHR requests...
		this.xhr.restore();

		// Enable jQuery animations...
		$.fx.off = false;
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
	'should fire "clickblocker:open" event',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('clickblocker:open', callback);
		this.command.execute();

		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0].key, 'singlepage');
	}
);

QUnit.test(
	'should fire "clickblocker:close" event on successful response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('clickblocker:close', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0].key, 'singlepage');
	}
);

QUnit.test(
	'should fire "clickblocker:close" event on failed response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('clickblocker:close', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 404);

		assert.ok(callback.calledOnce);
		assert.equal(callback.getCall(0).args[0].key, 'singlepage');
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
		this.context.vent.on('clickblocker:open', callback);
		this.context.vent.on('test:event:start', callback);
		this.context.vent.on('application:stop', callback);
		this.context.vent.on('application:start', callback);
		this.context.vent.on('test:event:end', callback);
		this.context.vent.on('clickblocker:close', callback);
		this.context.vent.on('test:event:done', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200);

		assert.equal(callback.getCall(0).args[0].eventName, 'test:event:init');
		assert.equal(callback.getCall(1).args[0].eventName, 'clickblocker:open');
		assert.equal(callback.getCall(2).args[0].eventName, 'test:event:start');
		assert.equal(callback.getCall(3).args[0].eventName, 'application:stop');
		assert.equal(callback.getCall(4).args[0].eventName, 'application:start');
		assert.equal(callback.getCall(5).args[0].eventName, 'test:event:end');
		assert.equal(callback.getCall(6).args[0].eventName, 'clickblocker:close');
		assert.equal(callback.getCall(7).args[0].eventName, 'test:event:done');
		assert.equal(callback.callCount, 8);
	}
);

QUnit.test(
	'should fire events in expected order on failed response',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('test:event:init', callback);
		this.context.vent.on('clickblocker:open', callback);
		this.context.vent.on('test:event:start', callback);
		this.context.vent.on('application:stop', callback);
		this.context.vent.on('application:start', callback);
		this.context.vent.on('test:event:end', callback);
		this.context.vent.on('clickblocker:close', callback);
		this.context.vent.on('test:event:done', callback);
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 500);

		assert.equal(callback.getCall(0).args[0].eventName, 'test:event:init');
		assert.equal(callback.getCall(1).args[0].eventName, 'clickblocker:open');
		assert.equal(callback.getCall(2).args[0].eventName, 'clickblocker:close');
		assert.equal(callback.getCall(3).args[0].eventName, 'test:event:done');
		assert.equal(callback.callCount, 4);
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
	'should scroll to top after navigation',
	function(assert) {
		var response = '<html><head></head><body><div><div id="main"><div>Some <b id="deeplink" style="margin-top: 3000px; padding-bottom: 3000px; display: block;">Response</b> HTML</div></div></div></body></html>';
		// Root element is by default fixed positioned...
		this.root.css({position: 'static'});

		// Set a user scroll position...
		$(window).scrollTop(200);

		// Rebuild 'replace()' function in view to simulate content injection:
		this.view.replace = function(contents) {
			// Append requested content into DOM:
			$('#main').append(contents);
		};

		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200, response);

		// Test if scroll position has changed
		assert.equal($(window).scrollTop(), 0, 'The position has has been set to top');

		// Reset position of root element...
		this.root.css({position: ''});
	}
);

QUnit.test(
	'should scroll to deeplink when requested an url with deeplink',
	function(assert) {
		var response = '<html><head></head><body><div><div id="main"><div>Some <b id="deeplink" style="margin-top: 3000px; padding-bottom: 3000px; display: block;">Response</b> HTML</div></div></div></body></html>';
		// Root element is by default fixed positioned...
		this.root.css({position: 'static'});

		// Reset scroll position to top...
		$(window).scrollTop(0);
		assert.equal($(window).scrollTop(), 0, 'The position is at the top of the document');

		// Rebuild 'replace()' function in view to simulate content injection:
		this.view.replace = function(contents) {
			// Append requested content into DOM:
			$('#main').append(contents);
		};

		this.command.eventData.href = this.command.eventData.href + '#deeplink';
		this.command.execute();

		// Trigger response...
		__response(this.requests[0], 200, response);

		// Test if scroll position has changed
		assert.notEqual($(window).scrollTop(), 0, 'The position has changed to the deeplink');

		// Reset position of root element...
		this.root.css({position: ''});
	}
);
