import Base from 'picnic/mixins/Base';


function __createUid(a) {
	if (a) {
		return (a ^ Math.random() * 16 >> a / 4).toString(16);
	} else {
		return ('10000000-1000-4000-8000-100000000000').replace(/[018]/g, __createUid);
	}
}


/**
 * This mixin adds a new method property to each applied instance which retuns
 * an unique ID. Each time this method is called on a certain instance, it
 * returns the same unique ID as before.
 *
 * @class UniqueID-Mixin
 * @example
 *		import UniqueMixin from 'picnic/mixins/Unique';
 *
 *		class Example {
 *			constructor() {
 *				// Apply mixin:
 *				new UniqueMixin(this);
 *			}
 *		}
 *
 *		var example = new Example();
 *		example.getUniqueId();
 */
class Mixin extends Base {

	/**
	 * This applies all mixin's properties to the given target instance and
	 * creates an unique ID.
	 *
	 * @constructor
	 * @param {object} target is the target instance of the class where to merge
	 *		the mixin's properties into.
	 */
	constructor(target) {
		super(target);
		target._uniqueId = __createUid();
	}

	/**
	 * This returns the unique ID. When passed `true` as param a new unique ID
	 * is calculated for this instance. The previous one gets lost.
	 *
	 * @param {boolean} force forces the re-calculculation of the unique ID.
	 *		Default is `false`.
	 * @return {string} is the unique ID.
	 */
	getUniqueId(force) {
		if (force) {
			this._uniqueId = __createUid();
		}

		return this._uniqueId;
	}

}

export default Mixin;
