/* global QUnit */
import {i18next} from 'picnic/core/utils/i18next';

QUnit.module('The core i18next util', {});

QUnit.test(
	'should mock i18next translation',
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

		assert.notOk(i18next.t(''));
		assert.notOk(i18next.t());
		assert.notOk(i18next.t(null, {foo: 'bar'}));
	}
);
