/* global QUnit */
import BaseMixin from 'picnic/mixins/Base';


QUnit.module('The base mixin');

QUnit.test('should merge all properties of a mixin into a class', function(assert) {

	class TestMixin extends BaseMixin {

		constructor(target) {
			super(target);
			target.baz = 'baz';
		}
		foo() { return 'foo'; }
		bar() { return 'baz'; }

	}

	class TestClass {
		constructor() {
			new TestMixin(this);
		}
	}

	var instance = new TestClass();
	assert.equal(typeof instance.foo, 'function', 'Merged the foo property');
	assert.equal(typeof instance.bar, 'function', 'Merged the bar property');
	assert.equal(typeof instance.baz, 'string', 'Set the baz property');
	assert.equal(instance.baz, 'baz', 'Set the baz property');
	assert.equal(instance.constructor, TestClass, 'The constructor won\'t be overwritten');

});
