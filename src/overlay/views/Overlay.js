import $ from 'jquery';
import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';
import Template from 'picnic/overlay/views/Overlay.html!text';
import UniqueMixin from 'picnic/mixins/Unique';


var
	CLASS_OPEN = 'open',

	SELECTOR_OVERLAY = '.overlay',
	SELECTOR_CLOSE = '.close',
	SELECTOR_CONTENT = '.overlay-content',
	SELECTOR_IMAGE = 'img',
	SELECTOR_LABEL = 'h1, h2, h3, h4, h5, h6',
	SELECTOR_DESCRIPTIONS = 'p',

	ARIA_HIDDEN = 'aria-hidden',
	ARIA_LABELLEDBY = 'aria-labelledby',
	ARIA_DESCRIBEDBY = 'aria-describedby',

	ID_LABELEDBY_PREFIX = 'overlay-label-',
	ID_DESCRIBEDBY_PREFIX = 'overlay-description-',

	ATTR_ID = 'id',
	ATTR_TABINDEX = 'tabindex',

	EVENT_RESIZE = 'resize',
	EVENT_CLICK = 'click',
	EVENT_KEYBOARD = 'keydown',
	EVENT_LOAD = 'load',

	KEY_ESCAPE = 27,

	MAX_TOP = 0,

	win = window,
	$window = $(win),
	template = _.template(Template),
	gettext = win.gettext,

	DEFAULTS = {
		target: $(document.body),
		selectorLabel: SELECTOR_LABEL,
		selectorDescription: SELECTOR_DESCRIPTIONS,
		closeTitle: gettext('Close this overlay'),
		closeLabel: gettext('Close')
	}
;


class View extends BaseView {

	constructor(options) {
		super($.extend(true, {}, DEFAULTS, options));

		// Load mixins:
		new UniqueMixin(this);

		_.bindAll(
			this,
			'_onWindowResize',
			'_onCloseClick',
			'_onKeyboard',
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

	set hasScrollblocker(value) {
		if (!_.isBoolean(value)) {
			return;
		}

		if (value === this.hasScrollblocker) {
			return;
		}

		if (value) {
			this._targetOverflowValue = this.options.target.prop('style').overflow || '';
		}

		this._hasScrollblocker = value;
		this.options.target.css('overflow', value ? 'hidden' : this._targetOverflowValue);
	}

	get hasScrollblocker() {
		return !!this._hasScrollblocker;
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

		// Get reference of content container and clear possible old content
		this._contentContainer = this._container.find(SELECTOR_CONTENT);
		this._contentContainer.html('');

		// append content:
		// note: content can already be a jquery object, but this doesn't
		// matter here:
		this._content = $(content).appendTo(this._contentContainer);

		this._setAriaReferences();
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
				.attr(ARIA_HIDDEN, (!value).toString());
		}

		if (value) {
			this.updatePosition();
			this.setFocused();
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

		//destroy Scrollblocker
		if (this._hasScrollblocker) {
			this.options.target.css('overflow', this._targetOverflowValue);
		}

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

	setFocused() {
		this._container.attr(ATTR_TABINDEX, '-1').focus();
	}

	_setAriaReferences() {
		var
			labelId = ID_LABELEDBY_PREFIX + this.getUniqueId(),
			labelEl = this._setAriaReference(
				ARIA_LABELLEDBY, labelId, this.options.selectorLabel
			),
			descriptionId = ID_DESCRIBEDBY_PREFIX + this.getUniqueId(),
			descriptionEl = this._setAriaReference(
				ARIA_DESCRIBEDBY, descriptionId, this.options.selectorDescription
			)
		;

		// Enshure description and labelledby are not set to the same element.
		// If it is, remove description...
		if (labelEl && descriptionEl && labelEl[0] === descriptionEl[0]) {
			this._contentContainer.removeAttr(ARIA_DESCRIBEDBY);

			if (descriptionEl.attr(ATTR_ID) === descriptionId) {
				descriptionEl.removeAttr(ATTR_ID);
			}
		}
	}

	_setAriaReference(aria, id, selector, forElement = this._contentContainer) {
		var element = null;

		// Find first matching element with text...
		this._contentContainer
			.find(selector)
			.each(function() {
				var current = $(this);

				if (current.text().length > 0) {
					element = current;
					return false;
				}
			});

		if (element) {
			// Enshure not to overwrite an existing id. If not exists an id,
			// use the unique id.
			id = element.attr(ATTR_ID) || id;
			element.attr(ATTR_ID, id);
			forElement.attr(aria, id);
		} else {
			forElement.removeAttr(aria);
		}

		return element;
	}

	_bindEvents() {
		$window.on(EVENT_RESIZE, this._onWindowResize);
		this._close.on(EVENT_CLICK, this._onCloseClick);
		this._container.on(EVENT_KEYBOARD, this._onKeyboard);
	}

	_unbindEvents() {
		$window.off(EVENT_RESIZE, this._onWindowResize);

		if (this._close) {
			this._close.off(EVENT_CLICK, this._onCloseClick);
			this._container.off(EVENT_KEYBOARD, this._onKeyboard);
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

	_onKeyboard(event) {
		if (event.which === KEY_ESCAPE) {
			var tagName = event.target.tagName.toLowerCase();
			if (!/input|select|textarea/.test(tagName)) {
				this.context.dispatch('overlay:close');
			} else if (this._close) {
				this._close.focus();
			}
		}
	}

	_onLoadedContent() {
		this.updatePosition();
	}
}

export default View;
