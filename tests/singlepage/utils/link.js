/*jshint scripturl:true*/
/* global QUnit */
import Link from 'picnic/singlepage/utils/Link';


QUnit.module('The singlepage link util', {});

QUnit.test('should fail when pass not expected values into the constructor ', function(assert) {
	assert.throws(function() {
		new Link(document.createElement('div'));
	}, new Error('Pass a location string or HTMLAnchorElement into the Link instance'));

	assert.throws(function() {
		new Link(true);
	}, new Error('Pass a location string or HTMLAnchorElement into the Link instance'));

	assert.throws(function() {
		new Link(42);
	}, new Error('Pass a location string or HTMLAnchorElement into the Link instance'));
});

QUnit.test('should refer to given location', function(assert) {
	var
		expectedLocation = {},
		link = new Link('https://foo.bar:8000/baz.html', {location: expectedLocation})
	;

	assert.equal(link._options.location, expectedLocation, 'is given location');
	assert.equal((new Link('https://foo.bar:8000/baz.html'))._options.location, window.location, 'is window.location');
});

QUnit.test('should return correct href', function(assert) {
	var element;

	assert.equal((new Link('http://foo.bar/baz.html')).href, 'http://foo.bar/baz.html', 'has same href');

	element = document.createElement('a');
	element.setAttribute('href', '/foo/');
	assert.equal((new Link('/foo/')).href, element.href, 'has relative path');
	assert.equal((new Link('')).href, window.location.href, 'is current page by empty string');

	element = document.createElement('a');
	element.href = 'http://foo.bar/baz.html';
	assert.equal((new Link(element).href), 'http://foo.bar/baz.html', 'has same href');
	element = document.createElement('a');
	element.href = '';
	assert.equal((new Link(element).href), window.location.href, 'is current page by empty href');
	element = document.createElement('a');
	assert.equal((new Link(element).href), window.location.href, 'is current page by missing href');
});

QUnit.test('should return correct protocol', function(assert) {

	assert.equal((new Link('http://foo.bar/baz.html').protocol), 'http:', 'has the same protocol');
	assert.notEqual((new Link('http://foo.bar/baz.html').protocol), 'https:', 'has not the same protocol');
});

QUnit.test('should return the correct hostname', function(assert) {
	assert.equal((new Link('http://foo.bar/baz.html').hostname), 'foo.bar', 'has the same hostname');
	assert.notEqual((new Link('http://foo.bar/baz.html').hostname), 'bar.foo', 'has not the same hostname');
});

QUnit.test('should return the correct port', function(assert) {
	assert.equal((new Link('http://foo.bar:8000/baz.html').port), '8000', 'it has the same port');
	assert.notEqual((new Link('http://foo.bar:8000/baz.html').port), '8001', 'it has not the same port');
});

QUnit.test('should return the same pathname', function(assert) {
	assert.equal((new Link('http://foo.bar:8000/baz.html').pathname), '/baz.html', 'It has the same pathname');
	assert.notEqual((new Link('http://foo.bar:8000/baz.html').pathname), '/foo.html', 'It has not the same pathname');
});

QUnit.test('should return the same search query', function(assert) {
	assert.equal((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz').search), '?foo=bar&bar=baz', 'It has the same search query');
	assert.notEqual((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz').search), '?bar=bar&bar=baz', 'It has not the same search query');
});


QUnit.test('should contain a hash', function(assert) {
	assert.equal((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz#hash').hash), '#hash', 'It has a hash');
	assert.notEqual((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz').hash), 'hash', 'It has no hash');
});

QUnit.test('should return the same target', function(assert) {
	assert.equal((new Link('http://foo.bar:8000/baz.html').target), '_self', 'It has the same target');
	assert.notEqual((new Link('http://foo.bar:8000/baz.html').target), '_blank', 'It has not the same target');
});

QUnit.test('should return the same title', function(assert) {
	var
		expected = 'this is the title',
		element
	;

	element = document.createElement('a'),
	element.setAttribute('title', expected);
	assert.equal((new Link(element).title), expected, 'It has the same title');
	element = document.createElement('a'),
	element.setAttribute('title', 'this is wrong');
	assert.notEqual((new Link(element).title), expected, 'It has not the same title');
	element = document.createElement('a'),
	assert.notOk((new Link(element).title), 'It has no title');
});

QUnit.test('should return if is a secure page', function(assert) {
	assert.ok((new Link('https://foo.bar:8000/baz.html')).isSecure, 'the page is secure');
	assert.notOk((new Link('http://foo.bar:8000/baz.html')).isSecure, 'the page is not secure');
});


QUnit.test('should return if is an insecure page', function(assert) {
	assert.ok((new Link('http://foo.bar:8000/baz.html')).isInsecure, 'the page is insecure');
	assert.notOk((new Link('https://foo.bar:8000/baz.html')).isInsecure, 'the page is not insecure');
});

QUnit.test('should return if is a download', function(assert) {
	var element;
	element = document.createElement('a');
	element.setAttribute('download', 'testFile.svg');
	assert.ok((new Link(element)).isDownload, 'it has a download attr');
	element = document.createElement('a');
	assert.notOk((new Link(element)).isDownload, 'it has no download attr');
	element = document.createElement('a');
	element.setAttribute('href', 'https://foo.bar:8000/baz.html');
	element.setAttribute('title', 'foo title');
	assert.notOk((new Link(element)).isDownload, 'it has no download attr');
});

QUnit.test('should return if is a mailto: Link', function(assert) {
	var element;
	element = document.createElement('a');
	element.setAttribute('href', 'mailto:Johndoe@example.com');
	assert.ok((new Link(element)).isMailTo, 'it is a mailto: Link');
	element = document.createElement('a');
	assert.notOk((new Link(element)).isMailTo, 'it is no mailto: Link');
});

QUnit.test('should return if is a javascript: Link', function(assert) {
	var element;
	element = document.createElement('a');
	element.setAttribute('href', 'javascript:foo();');
	assert.ok((new Link(element)).isJavaScript, 'it is a javascript: Link');
	element = document.createElement('a');
	assert.notOk((new Link(element)).isJavaScript, 'it is no javascript: Link');
});

QUnit.test('should return if has a hash', function(assert) {
	assert.ok((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz#hash')).hasHash, 'it has a hash');
	assert.ok((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz#hash#ass#baz')).hasHash, 'it has a hash');
	assert.notOk((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz')).hasHash, 'it has no hash');
	assert.notOk((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz#')).hasHash, 'it has an empty hash');
});

QUnit.test('should return if has a search string', function(assert) {
	assert.ok((new Link('http://foo.bar:8000/baz.html?foo=bar&bar=baz#hash')).hasSearch, 'it has a search string');
	assert.notOk((new Link('http://foo.bar:8000/baz.html')).hasSearch, 'it has no search string');
});

QUnit.test('should return expected value when asking for "isSameProtocol()"', function(assert) {
	assert.ok((new Link('https://foo.bar:8000/baz.html', {location: {protocol: 'https:'}})).isSameProtocol, 'it has same protocol');
	assert.notOk((new Link('http://foo.bar:8000/baz.html', {location: {protocol: 'https:'}})).isSameProtocol, 'it has not the same protocol');
});

QUnit.test('should return expected value when asking for "isSameHostname()"', function(assert) {
	assert.ok((new Link('https://foo.bar:8000/baz.html', {location: {hostname: 'foo.bar'}})).isSameHostname, 'it has the same hostname');
	assert.notOk((new Link('http://bar.foo:8000/baz.html', {location: {hostname: 'foo.bar'}})).isSameHostname, 'it has not the same hostname');
});

QUnit.test('should return expected value when asking for "isSamePort()"', function(assert) {
	assert.ok((new Link('https://foo.bar:8000/baz.html', {location: {port: '8000'}})).isSamePort, 'it has the same port');
	assert.notOk((new Link('http://foo.bar:1234/baz.html', {location: {port: '8000'}})).isSamePort, 'it has not the same port');
});

QUnit.test('should return expected value when asking for "isSamePathname()"', function(assert) {
	assert.ok((new Link('http://foo.bar:8000/baz.html', {location: {pathname: '/baz.html'}})).isSamePathname, 'it has the same pathname');
	assert.notOk((new Link('http://foo.bar:8000/foo.html', {location: {pathname: '/baz.html'}})).isSamePathname, 'it has not the same pathname');
});

QUnit.test('should return expected value when asking for "isSameSearch()"', function(assert) {
	var searchString = 'foo=bar&baz';
	assert.ok((new Link('https://foo.bar:8000/baz.html?' + searchString, {location: {search: searchString}})).isSameSearch, 'it has same search param');
	assert.ok((new Link('https://foo.bar:8000/baz.html?' + searchString, {location: {search: 'baz&foo=bar'}})).isSameSearch, 'it has same search param but changed order.');
	assert.ok((new Link('https://foo.bar:8000/baz.html?' + searchString, {location: {search: 'baz=&foo=bar'}})).isSameSearch, 'same search param in changed order with trailing "=" which should be cut off');
	assert.ok((new Link('https://foo.bar:8000/baz.html?foo=bar&bar=baz', {location: {search: 'bar=baz&foo=bar'}})).isSameSearch, 'it has 2 search params in same order');
	assert.ok((new Link('https://foo.bar:8000/baz.html?foo=', {location: {search: 'foo='}})).isSameSearch, 'it has trailing "=" which should be cut off');
	assert.ok((new Link('https://foo.bar:8000/baz.html?foo=', {location: {search: 'foo'}})).isSameSearch, 'it has trailing "=" which should be cut off');
	assert.notOk((new Link('http://foo.bar:8000/baz.html?bar=foo&false', {location: {search: 'foo=bar&baz'}})).isSameSearch, 'it has wrong search param');
});

QUnit.test('should return expected value when asking for "isSameHash()"', function(assert) {
	assert.ok((new Link('https://foo.bar:8000/baz.html?foo=bar&baz#hash', {location: {hash: '#hash'}})).isSameHash, 'it has same hash');
	assert.notOk((new Link('http://foo.bar:8000/baz.html?foo=bar&baz#falseHash', {location: {hash: '#hash'}})).isSameHash, 'it has wrong hash');
});

QUnit.test('should return expected value when asking for "isTargetSelf()"', function(assert) {
	var element = document.createElement('a');
	element.setAttribute('target', '_self');
	assert.ok((new Link(element).isTargetSelf), 'It has the same target');
	element.setAttribute('target', '_SELF');
	assert.ok((new Link(element).isTargetSelf), 'It has the same target');
	element.setAttribute('target', '_wrong');
	assert.notOk((new Link(element).isTargetSelf), 'It has not the same target');
	element.setAttribute('target', '_WRONG');
	assert.notOk((new Link(element).isTargetSelf), 'It has not the same target');
});

QUnit.test('should return expected value when asking for "isTargetBlank()"', function(assert) {
	var element = document.createElement('a');
	element.setAttribute('target', '_blank');
	assert.ok((new Link(element).isTargetBlank), 'It has the same target');
	element.setAttribute('target', '_Blank');
	assert.ok((new Link(element).isTargetBlank), 'It has the same target');
	element.setAttribute('target', '_wrong');
	assert.notOk((new Link(element).isTargetBlank), 'It has the not same target');
	element.setAttribute('target', '_Wrong');
	assert.notOk((new Link(element).isTargetBlank), 'It has the not same target');
});

QUnit.test('should return expected value when asking for "isTargetParent()"', function(assert) {
	var element = document.createElement('a');
	element.setAttribute('target', '_parent');
	assert.ok((new Link(element).isTargetParent), 'It has the same target');
	element.setAttribute('target', '_PARENT');
	assert.ok((new Link(element).isTargetParent), 'It has the same target');
	element.setAttribute('target', '_wrong');
	assert.notOk((new Link(element).isTargetParent), 'It has the not same target');
	element.setAttribute('target', '_Wrong');
	assert.notOk((new Link(element).isTargetParent), 'It has the not same target');
});

QUnit.test('should return expected value when asking for "isTargetTop()"', function(assert) {
	var element = document.createElement('a');
	element.setAttribute('target', '_top');
	assert.ok((new Link(element).isTargetTop), 'It has the same target');
	element.setAttribute('target', '_ToP');
	assert.ok((new Link(element).isTargetTop), 'It has the same target');
	element.setAttribute('target', '_wrong');
	assert.notOk((new Link(element).isTargetTop), 'It has the not same target');
	element.setAttribute('target', '_Wrong');
	assert.notOk((new Link(element).isTargetTop), 'It has the not same target');
});
