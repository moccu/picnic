/* global QUnit */
import UniqueMixin from 'picnic/mixins/Unique';


class Module {
	constructor() {
		new UniqueMixin(this);
	}
}


QUnit.module('The unique mixin');

QUnit.test('should return unique ids', function(assert) {
	assert.notEqual(
		new Module(this.config).getUniqueId(),
		new Module(this.config).getUniqueId()
	);
});

QUnit.test('should return same id on instance', function(assert) {
	var instance = new Module(this.config);
	assert.equal(instance.getUniqueId(), instance.getUniqueId());
});

QUnit.test('should force to generate a new id on instance', function(assert) {
	var
		instance = new Module(this.config),
		first = instance.getUniqueId(),
		second = instance.getUniqueId(true)
	;

	assert.notEqual(first, second);
	assert.equal(second, instance.getUniqueId());
});

QUnit.test('should return id in expected format', function(assert) {
	var
		instance = new Module(this.config),
		format = /^[a-z0-9]{8}\-[a-z0-9]{4}\-[a-z0-9]{4}\-[a-z0-9]{4}\-[a-z0-9]{12}$/
	;

	assert.ok(format.test(instance.getUniqueId()));
});
