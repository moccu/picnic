import _ from 'underscore';

/**
 * The base mixin class. This class allows to merge properties of a specific
 * mixin class into an instance of an other class.
 *
 * @class Base-Mixin
 * @example
 *		import BaseMixin from 'picnic/mixins/Base';
 *
 *		class ExampleMixin extends BaseMixin {
 *			sayHello() {
 *				alert('Hello!');
 *			}
 *		}
 *
 *		class Example {
 *			constructor() {
 *				// Apply mixin:
 *				new ExampleMixin(this);
 *			}
 *
 *			sayWhat() {
 *				alert('What?');
 *			}
 *		}
 *
 *		var example = new Example();
 *		example.sayWhat();
 *		example.sayHello();
 */
class Mixin {

	/**
	 * This applies all mixin's properties to the given target instance.
	 *
	 * @constructor
	 * @param {object} target is the target instance of the class where to merge
	 *		the mixin's properties into.
	 */
	constructor(target) {
		var props = Object.getOwnPropertyNames(this.constructor.prototype);
		props = _.without(props, 'constructor');

		_.each(props, function(prop) {
			target[prop] = this[prop];
		}, this);
	}

}

export default Mixin;
