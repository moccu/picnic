import $ from 'jquery';
import _ from 'underscore';
import 'kenwheeler/slick';
import BaseView from 'picnic/core/views/Base';
import TemplatePaging from 'picnic/slideshow/views/Paging.html!text';
import TemplateArrow from 'picnic/slideshow/views/Arrow.html!text';

var
	gettext = window.gettext,
	templatePaging = _.template(TemplatePaging),
	templateArrow = _.template(TemplateArrow),

	SELECTOR_IMAGES = 'img, picture',

	DEFAULTS = {
		arrowPrevTitle: gettext('Go to the previous slide'),
		arrowPrevLabel: gettext('Previous'),
		arrowNextTitle: gettext('Go to the next slide'),
		arrowNextLabel: gettext('Next'),
		dotsTitle: gettext('Go to slide {{ index }}')
	},

	SETTINGS = {
		// Settings @ http://kenwheeler.github.io/slick/
		accessibility: true, // Enables tabbing and arrow key navigation
		adaptiveHeight: true, // Enables adaptive height for single slide horizontal carousels
		autoplay: false, // Enables autoplay
		arrows: false, // Prev/Next Arrows
		dots: false, // Show dot indicators
		dotsClass: 'pagination', // Set the classname
		draggable: false, // Enable mouse dragging
		infinite: false, // Infinite loop sliding
		slidesToShow: 1, // Number of slides to show
		slidesToScroll: 1, // Number of slides to scroll
		swipe: true, // Enable swiping
		vertical: false, // Vertical slide mode
		// Object containing breakpoints and settings objects (see demo).
		// Enables settings sets at given screen width. Set settings to
		// "unslick" instead of an object to disable slick at a given
		// breakpoint.
		responsive: undefined,
		refresh: true
	}
;


class View extends BaseView {

	constructor(options) {
		super($.extend(true, {}, DEFAULTS, options));

		_.bindAll(this, '_onLoadImages');
	}

	render() {
		var
			self = this,
			options = self.options,
			settings = $.extend({}, SETTINGS, options.settings),
			selector = options.selector,
			element = selector ? this.$el.find(selector) : self.$el
		;

		// Add default custom templates when they are not defined by settings:
		settings.prevArrow = settings.prevArrow || templateArrow({
			title: options.arrowPrevTitle,
			label: options.arrowPrevLabel,
			className: 'prev',
			ariaLabel: 'previous'
		});
		settings.nextArrow = settings.nextArrow || templateArrow({
			title: options.arrowNextTitle,
			label: options.arrowNextLabel,
			className: 'next',
			ariaLabel: 'next'
		});
		settings.customPaging = settings.customPaging || function(slider, i) {
			return templatePaging({index: i + 1, title: options.dotsTitle});
		};

		// Initialize this element as slideshow and directly access the Slick
		// instance which is stored on the DOM element as "slick" property:
		self.slideshow = element.slick(settings)[0].slick;

		self.$el.find(SELECTOR_IMAGES)
			.one('load', self._onLoadImages);

		return self;
	}

	prev() {
		this.slideshow.prev();
	}

	next() {
		this.slideshow.next();
	}

	resize() {
		this.slideshow.resize();
	}

	_onLoadImages() {
		this.resize();
	}

}

export default View;
