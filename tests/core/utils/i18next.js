/* global QUnit, sinon */
import {i18next} from 'picnic/core/utils/i18next';

QUnit.module('The core i18next util', {
	afterEach: function() {
		delete window.i18next;
	}
});

QUnit.test(
	'should wrap i18next translation function',
	function(assert) {
		window.i18next = {};
		window.i18next.t = sinon.spy(function() {
			return 'bar';
		});

		const props = {bar: 'baz'};
		assert.equal(i18next.t('foo', props), 'bar');
		assert.equal(window.i18next.t.callCount, 1);
		assert.deepEqual(window.i18next.t.getCall(0).args, ['foo', props]);
		assert.equal(window.i18next.t.getCall(0).args[1], props);
	}
);

QUnit.test(
	'should polyfill i18next translation',
	function(assert) {
		assert.equal(
			i18next.t('This is a translation'),
			'This is a translation'
		);
		assert.equal(
			i18next.t('This is a translation with data "{{ foo }}"', {foo: 'bar'}),
			'This is a translation with data "bar"'
		);
		assert.equal(
			i18next.t('This is a translation with mulitple data "{{ foo }}, {{bar}}, {{baz }}, {{ bat}}"', {foo: 'a', bar: 'b', baz: 'c', bat: 'd'}),
			'This is a translation with mulitple data "a, b, c, d"'
		);
		assert.equal(
			i18next.t('This is a translation with missmatching data "{{ foo }}"', {bar: 'foo'}),
			'This is a translation with missmatching data "{{ foo }}"'
		);
		assert.equal(
			i18next.t('This is a translation with missing data "{{ foo }}"'),
			'This is a translation with missing data "{{ foo }}"'
		);
		assert.equal(i18next.t(''), '');
		assert.equal(i18next.t(), undefined);
		assert.equal(i18next.t(null, {foo: 'bar'}), null);
	}
);
