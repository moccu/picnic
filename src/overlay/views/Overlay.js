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

	EVENT_RESIZE = 'resize',
	EVENT_CLICK = 'click',
	EVENT_LOAD = 'load',

	MAX_TOP = 0,

	win = window,
	$window = $(win),
	template = _.template(Template),
	gettext = win.gettext,

	DEFAULTS = {
		target: $(document.body),
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
		var self = this;
		if (self._container) {
			// Remove old classname, if exists:
			self._container.removeClass(self._className);

			// Set new classname:
			self._className = className;
			self._container.addClass(className);

			// Class changes can end up in dimension changes. Recalculate position:
			self.updatePosition();
		}
	}

	render(content) {
		var
			self = this,
			options = self.options,
			settings
		;

		// test for content to render into overlay:
		content = content || options.content;
		if (typeof content !== 'string' && typeof content !== 'object') {
			throw new Error('Overlay content cannot be a type of ' + (typeof content));
		}

		// generate overlay:
		if (!self._container) {
			settings = {
				title: options.closeTitle,
				label: options.closeLabel
			};
			self._container = $(template(settings))
				.filter(SELECTOR_OVERLAY)
				.appendTo(options.target);
			self._close = self._container.find(SELECTOR_CLOSE);
			self._bindEvents();
		} else {
			// cleanup old content:
			self._unbindContentEvents();
			self._content.remove();
		}

		// Close overlay
		self._container.removeClass(CLASS_OPEN);

		// append content:
		// note: content can already be a jquery object, but this doesn't
		// matter here:
		self._content = $(content)
			.appendTo(
				self._container
					.find(SELECTOR_CONTENT)
					.html('')
			);


		self._bindContenEvents();

		return self;
	}

	get isOpen() {
		return this._isOpen;
	}

	open() {
		var self = this;

		if (!self._isOpen) {
			self._isOpen = true;
			self._container.addClass(CLASS_OPEN);
			self.updatePosition();
		}

		return self;
	}

	close(destroy) {
		var self = this;

		if (self._isOpen) {
			self._isOpen = false;
			self._container.removeClass(CLASS_OPEN);

			if (destroy) {
				self._unbindEvents();
				self._container.remove();
			}
		}

		return self;
	}

	destroy() {
		this.close(true);

		//destroy Scrollblocker
		if (this._hasScrollblocker) {
			this.options.target.css('overflow', this._targetOverflowValue);
		}
	}

	updatePosition() {
		if (this._isOpen) {
			var
				self = this,
				reference = $(self._reference || self.options.reference || win),
				referenceOffset = reference.offset() || {},
				referenceTop = referenceOffset.top || 0,
				referenceHeight = reference.outerHeight(true),

				container = self._container,
				containerWidth = container.outerWidth(true),
				containerHeight = container.outerHeight(true),

				top = referenceTop - ((containerHeight - referenceHeight) / 2),
				left = ($window.width() - containerWidth) / 2,
				css = {
					position: self._reference ? 'absolute' : 'fixed',
					top: Math.round(Math.max(MAX_TOP, top)),
					left: Math.round(left)
				}
			;

			container.css(css);
		}
	}

	_bindEvents() {
		var self = this;

		$window.on(EVENT_RESIZE, self._onWindowResize);
		self._close.on(EVENT_CLICK, self._onCloseClick);
	}

	_unbindEvents() {
		var self = this;

		$window.off(EVENT_RESIZE, self._onWindowResize);
		self._close.off(EVENT_CLICK, self._onCloseClick);
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
