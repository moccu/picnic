/* global QUnit, sinon */
import Logger from 'picnic/core/utils/Logger';

QUnit.module('The core logger util', {

	beforeEach: function() {
		sinon.stub(window.console, 'log');
		sinon.stub(window.console, 'info');
		sinon.stub(window.console, 'warn');
		sinon.stub(window.console, 'error');
	},

	afterEach: function() {
		window.console.log.restore();
		window.console.info.restore();
		window.console.warn.restore();
		window.console.error.restore();
	}

});

QUnit.test(
	'should fail creating without modulename',
	function(assert) {
		assert.throws(function() {
			new Logger();
		}, new Error('The logger requires a modulename.'));
	}
);

QUnit.test(
	'should log with given data',
	function(assert) {
		var logger = new Logger({modulename: 'Test'});
		logger.log('foo', ['bar']);
		logger.log({baz: 'buff'});

		assert.deepEqual(window.console.log.getCall(0).args, [
			'[Test : 1]', 'foo', ['bar']
		]);

		assert.deepEqual(window.console.log.getCall(1).args, [
			'[Test : 2]', {baz: 'buff'}
		]);
	}
);

QUnit.test(
	'should info with given data',
	function(assert) {
		var logger = new Logger({modulename: 'Test'});
		logger.info('foo', ['bar']);
		logger.info({baz: 'buff'});

		assert.deepEqual(window.console.info.getCall(0).args, [
			'[Test : 1]', 'foo', ['bar']
		]);

		assert.deepEqual(window.console.info.getCall(1).args, [
			'[Test : 2]', {baz: 'buff'}
		]);
	}
);

QUnit.test(
	'should warn with given data',
	function(assert) {
		var logger = new Logger({modulename: 'Test'});
		logger.warn('foo', ['bar']);
		logger.warn({baz: 'buff'});

		assert.deepEqual(window.console.warn.getCall(0).args, [
			'[Test : 1]', 'foo', ['bar']
		]);

		assert.deepEqual(window.console.warn.getCall(1).args, [
			'[Test : 2]', {baz: 'buff'}
		]);
	}
);

QUnit.test(
	'should error with given data',
	function(assert) {
		var logger = new Logger({modulename: 'Test'});
		logger.error('foo', ['bar']);
		logger.error({baz: 'buff'});

		assert.deepEqual(window.console.error.getCall(0).args, [
			'[Test : 1]', 'foo', ['bar']
		]);

		assert.deepEqual(window.console.error.getCall(1).args, [
			'[Test : 2]', {baz: 'buff'}
		]);
	}
);
