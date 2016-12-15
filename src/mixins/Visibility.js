import $ from 'jquery';
import Backbone from 'backbone';
import Base from 'picnic/mixins/Base';


var $window = $(window);


function __onScroll() {
	if (this.isVisible()) {
		if (!this.__mixinVisibilityIsVisible) {
			this.__mixinVisibilityIsVisible = true;
			this.trigger('visibility:visible', {
				visibility: true,
				instance: this
			});
		}
	} else {
		if (this.__mixinVisibilityIsVisible) {
			this.__mixinVisibilityIsVisible = false;
			this.trigger('visibility:invisible', {
				visibility: false,
				instance: this
			});
		}
	}
}


class Mixin extends Base {

	/**
	 * This applies all mixin's properties to the given target instance. The
	 * mixin's features will be initialized on the targets instance `render()`
	 * call and destroyed when `destroy()` is called. Once rendered this mixin
	 * fires events when the instance's DOM element is getting visible or
	 * invisible on the users viewport. These events are `'visibility:visible'`
	 * and `'visibility:invisible'`. It's also possible to define an offset in
	 * pixels when to fire the events.
	 *
	 * @constructor
	 * @param {object} target is the target instance of the class where to merge
	 *		the mixin's properties into.
	 * @param {number} offset is the offset for the visibility calculation. A
	 *		positive offset defines the instance's DOM element to be higher as
	 *		it is, a negative to be shorter. Default is `0`.
	 */
	constructor(target, offset = 0) {
		if (!(target instanceof Backbone.View)) {
			throw new Error('The visibility mixin needs to be applied on a backbone view instance.');
		}

		target.__mixinVisibility = {
			initialized: false,
			offset: offset,
			render: target.render,
			destroy: target.destroy,
			onScroll: $.proxy(__onScroll, target)
		};

		super(target);
	}

	render() {
		if (this.__mixinVisibility && !this.__mixinVisibility.initialized) {
			this.__mixinVisibility.initialized = true;
			this.__mixinVisibility.render.apply(this, arguments);
			this.__mixinVisibility.onScroll();

			$window
				.on('scroll', this.__mixinVisibility.onScroll)
				.on('resize', this.__mixinVisibility.onScroll);
		}

		return this;
	}

	destroy() {
		if (this.__mixinVisibility) {
			$window
				.off('scroll', this.__mixinVisibility.onScroll)
				.off('resize', this.__mixinVisibility.onScroll);

			this.__mixinVisibility.destroy.apply(this, arguments);
		}
	}

	/**
	 * Returns if the DOM element is visible on the users viewport.
	 *
	 * @return {boolean} if the element visible.
	 */
	isVisible() {
		var
			offset = this.__mixinVisibility.offset,
			viewportHeight = $window.height(),
			viewportTop = $window.scrollTop(),
			elementHeight = this.$el.outerHeight(true),
			elementTop = this.$el.offset().top
		;

		return viewportTop + viewportHeight >= elementTop - offset &&
			viewportTop <= elementTop + elementHeight + offset;
	}

}

export default Mixin;
