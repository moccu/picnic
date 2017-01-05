import $ from 'jquery';
import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';
import Template from 'picnic/overlay/views/Overlay.html!text';


var
	CLASS_OPEN = 'open',

	SELECTOR_OVERLAY = '.overlay',
	SELECTOR_CLOSE = '.close',
	SELECTOR_CONTENT = '.overlay-content',
	SELECTOR_IMAGE = 'img',

	ARIA_HIDDEN = 'aria-hidden',

	EVENT_RESIZE = 'resize',
	EVENT_CLICK = 'click',
	EVENT_LOAD = 'load',

	MAX_TOP = 0,

	win = window,
	$window = $(win),
	template = _.template(Template),
	gettext = win.gettext,

	DEFAULTS = {
		target: $('body'),
		closeTitle: gettext('Close this overlay'),
		closeLabel: gettext('Close')
	}
;


class View extends BaseView {

	constructor(options) {
		super($.extend(true, {}, DEFAULTS, options));

		_.bindAll(
			this,
			'_onWindowResize',
			'_onCloseClick',
			'_onLoadedContent'
		);
	}

	getContainer() {
		return this._container;
	}

	getContent() {
		return this._content;
	}

	set reference(value) {
		this._reference = value;
		this.updatePosition();
	}

	get reference() {
		return this._reference;
	}

	set hasClickblocker(value) {
		this._hasClickblocker = value;
	}

	get hasClickblocker() {
		return !!this._hasClickblocker;
	}

	addClass(className) {
		if (this._container) {
			// Remove old classname, if exists:
			this._container.removeClass(this._className);

			// Set new classname:
			this._className = className;
			this._container.addClass(className);

			// Class changes can end up in dimension changes. Recalculate position:
			this.updatePosition();
		}
	}

	render(content) {
		var settings;

		// test for content to render into overlay:
		content = content || this.options.content;
		if (typeof content !== 'string' && typeof content !== 'object') {
			throw new Error('Overlay content cannot be a type of ' + (typeof content));
		}

		// generate overlay:
		if (!this._container) {
			settings = {
				title: this.options.closeTitle,
				label: this.options.closeLabel
			};
			this._container = $(template(settings))
				.filter(SELECTOR_OVERLAY)
				.appendTo(this.options.target);
			this._close = this._container.find(SELECTOR_CLOSE);
			this._bindEvents();
		} else {
			// cleanup old content:
			this._unbindContentEvents();
			this._content.remove();
		}

		// Close overlay
		this.isOpen = false;

		// append content:
		// note: content can already be a jquery object, but this doesn't
		// matter here:
		this._content = $(content)
			.appendTo(
				this._container
					.find(SELECTOR_CONTENT)
					.html('')
			);


		this._bindContenEvents();

		return this;
	}

	get isOpen() {
		return !!this._isOpen;
	}

	set isOpen(value) {
		this._isOpen = value;

		if (this._container) {
			this._container
				.toggleClass(CLASS_OPEN, value)
				.attr(ARIA_HIDDEN, value.toString());
		}

		if (value) {
			this.updatePosition();
		}
	}

	open() {
		this.isOpen = true;
		return this;
	}

	close(destroy = false) {
		this.isOpen = false;

		if (destroy) {
			this._unbindEvents();

			if (this._container) {
				this._container.remove();
			}
		}

		return this;
	}

	destroy() {
		this.close(true);
		super.destroy();
	}

	updatePosition() {
		if (this.isOpen) {
			var
				reference = $(this._reference || this.options.reference || win),
				referenceOffset = reference.offset() || {},
				referenceTop = referenceOffset.top || 0,
				referenceHeight = reference.outerHeight(true),

				container = this._container,
				containerWidth = container.outerWidth(true),
				containerHeight = container.outerHeight(true),

				top = referenceTop - ((containerHeight - referenceHeight) / 2),
				left = ($window.width() - containerWidth) / 2,
				css = {
					position: this._reference ? 'absolute' : 'fixed',
					top: Math.round(Math.max(MAX_TOP, top)),
					left: Math.round(left)
				}
			;

			container.css(css);
		}
	}

	_bindEvents() {
		$window.on(EVENT_RESIZE, this._onWindowResize);
		this._close.on(EVENT_CLICK, this._onCloseClick);
	}

	_unbindEvents() {
		$window.off(EVENT_RESIZE, this._onWindowResize);

		if (this._close) {
			this._close.off(EVENT_CLICK, this._onCloseClick);
		}
	}

	_bindContenEvents() {
		this._container.find(SELECTOR_IMAGE).on(EVENT_LOAD, this._onLoadedContent);
	}

	_unbindContentEvents() {
		this._container.find(SELECTOR_IMAGE).off(EVENT_LOAD, this._onLoadedContent);
	}

	_onWindowResize() {
		this.updatePosition();
	}

	_onCloseClick(event) {
		event.preventDefault();
		this.context.dispatch('overlay:close');
	}

	_onLoadedContent() {
		this.updatePosition();
	}
}

export default View;
