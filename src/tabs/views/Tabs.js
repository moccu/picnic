import $ from 'jquery';
import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';
import UniqueMixin from 'picnic/mixins/Unique';


// Inspired by: http://www.oaa-accessibility.org/examplep/accordian1/


var
	SELECTOR_BUTTON = '[href^="#"]',
	ATTR_ROLE = 'role',
	ATTR_ARIA_SELECTED = 'aria-selected',
	ATTR_ARIA_CONTROLS = 'aria-controls',
	ATTR_AIRA_HIDDEN = 'aria-hidden',
	ATTR_AIRA_LABELLEDBY = 'aria-labelledby',
	ATTR_ARIA_EXPANDED = 'aria-expanded',
	ATTR_AIRA_DISABLED = 'aria-disabled',
	ATTR_ARIA_MULTISELECTABLE = 'multiselectable',
	ATTR_TABINDEX = 'tabindex',
	EVENT_CLICK = 'click',
	EVENT_KEYDOWN = 'keydown',
	EVENT_FOCUS = 'focus blur',
	KEY_ENTER = 13,
	KEY_SPACE = 32,
	KEY_ARROW_LEFT = 37,
	KEY_ARROW_UP = 38,
	KEY_ARROW_RIGHT = 39,
	KEY_ARROW_DOWN = 40,
	KEY_END = 35,
	KEY_HOME = 36,
	DEFAULTS = {
		root: undefined,
		active: 0,
		toggleable: false,
		multiselectable: false,
		classActive: 'is-active',
		classCollapsed: 'is-collapsed',
		classDisabled: 'is-disabled'
	}
;


class View extends BaseView {

	constructor(options) {
		super($.extend({}, DEFAULTS, options));

		// Load mixins:
		new UniqueMixin(this);

		_.bindAll(
			this,
			'_onClick',
			'_onIgnoredClick',
			'_onKeydown',
			'_onFocus'
		);
	}

	get active() {
		return this._active;
	}

	set active(value) {
		if (this.isDisabledTabAt(value)) {
			return;
		}

		if (this.isMultiselectable) {
			this._toggle(value, !this.isActiveTabAt(value));
		} else {
			if (this.options.toggleable && value === this._active) {
				value = -1;
			}

			if (value !== this._active && value < this._buttons.length) {
				this._buttons.each(index => {
					this._toggle(index, value === index);
					this._active = value;
				});
			}
		}
	}

	get isMultiselectable() {
		// This caches the return value of the initial call:
		this._isMultiselectable = this._isMultiselectable || (function() {
			return this.options.multiselectable ||
				(this.$el.attr(ATTR_ARIA_MULTISELECTABLE) || '').toLowerCase() === 'true';
		}.bind(this))();

		return this._isMultiselectable;
	}

	render() {
		this._buttons = $();
		this._ignoredButtons = $();

		this.$el
			.attr(ATTR_ROLE, 'tablist')
			.attr(ATTR_ARIA_MULTISELECTABLE, this.isMultiselectable)
			.find(SELECTOR_BUTTON)
				.each((index, button) => {
					// Find duplicates in parsed button list with same href:
					var count = this._buttons
						.filter('[href="' + $(button).attr('href') + '"]').length;

					if (count === 0) {
						this._buttons.push(button);
					} else {
						this._ignoredButtons.push(button);
					}
				});

		this._buttons
			// Check disabled state of each tab...
			.each(index => {
				if (this.isDisabledTabAt(index)) {
					// When tab is disabled by class, force aria and other updates
					// on tab and button to keep consistent accessible state...
					this.disableTabAt(index);
				}
			})
			// Buttons are by default not selected
			.attr(ATTR_ARIA_SELECTED, 'false')
			// Bind click events
			.on(EVENT_CLICK, this._onClick)
			.on(EVENT_KEYDOWN, this._onKeydown)
			.on(EVENT_FOCUS, this._onFocus);

		this._ignoredButtons
			.on(EVENT_CLICK, this._onIgnoredClick);

		this.collapseAll();
		this.active = this.options.active;

		return this;
	}

	destroy() {
		if (this._buttons) {
			this._buttons
				.off(EVENT_CLICK, this._onClick)
				.off(EVENT_KEYDOWN, this._onKeydown)
				.off(EVENT_FOCUS, this._onFocus);

			this._buttons = undefined;
			delete(this._buttons);
		}

		if (this._ignoredButtons) {
			this._ignoredButtons
				.off(EVENT_CLICK, this._onIgnoredClick);
			this._ignoredButtons = undefined;
			delete(this._ignoredButtons);
		}

		super.destroy();
	}

	getTabAt(index) {
		return this._buttons.eq(index).parent();
	}

	getButtonAt(index) {
		return this._buttons.eq(index);
	}

	enableTabAt(index) {
		this._disableTabAt(index, false);
	}

	disableTabAt(index) {
		this._disableTabAt(index, true);
	}

	isDisabledTabAt(index) {
		if (index < 0 || index >= this._buttons.length) {
			return false;
		}

		return this.getTabAt(index)
			.hasClass(this.options.classDisabled);
	}

	isActiveTabAt(index) {
		if (index < 0 || index >= this._buttons.length) {
			return false;
		}

		return this.getTabAt(index)
			.hasClass(this.options.classActive);
	}

	collapse(index) {
		this._toggle(index, false);
	}

	collapseAll() {
		this._buttons.each(index => {
			this._toggle(index, false);
		});
	}

	_disableTabAt(index, disabled) {
		this.getTabAt(index).toggleClass(this.options.classDisabled, disabled);

		if (disabled) {
			this.getButtonAt(index)
				.attr(ATTR_AIRA_DISABLED, 'true')
				.attr(ATTR_TABINDEX, '-1');
		} else {
			this.getButtonAt(index)
				.removeAttr(ATTR_AIRA_DISABLED)
				.removeAttr(ATTR_TABINDEX);
		}
	}

	_toggle(index, isActive) {
		var
			button = this._buttons.eq(index),
			buttonId = button.attr('id') || this.getUniqueId(true),
			selector = button.attr('href'),
			panel = $(selector, this.options.root),
			tab = button.parent()
		;

		if (!_.isBoolean(isActive)) {
			// If isActive is not defined, this is the toggling feature...
			isActive = !this.isActiveTabAt(index);
		}

		tab
			.toggleClass(this.options.classActive, isActive);

		button
			.attr('id', buttonId)
			.attr(ATTR_ROLE, 'tab')
			.attr(ATTR_ARIA_EXPANDED, isActive)
			.attr(ATTR_ARIA_CONTROLS, selector.replace('#', ''));

		panel
			.attr(ATTR_ROLE, 'tabpanel')
			.attr(ATTR_AIRA_HIDDEN, (!isActive).toString())
			.attr(ATTR_AIRA_LABELLEDBY, buttonId)
			.toggleClass(this.options.classCollapsed, !isActive);

		if (isActive) {
			this._active = index;
		}
	}

	_focusButtonAt(index, direction = 1) {
		if (Math.abs(direction) !== 1) {
			throw new Error('Pass a direction of 1 or -1 for focusing a button.');
		}

		if (index < 0) {
			index = this._buttons.length - 1;
		} else if (index >= this._buttons.length) {
			index = 0;
		}

		if (this.isDisabledTabAt(index)) {
			return this._focusButtonAt(index + direction, direction);
		}

		this._buttons.eq(index).focus();
		return true;
	}

	_onClick(event) {
		var index = this._buttons.index(event.currentTarget);
		event.preventDefault();
		event.stopPropagation();

		if (!this.isDisabledTabAt(index)) {
			this.active = index;

			this.trigger('change', {
				instance: this,
				active: this.active
			});

			this.context.dispatch('tabs:change', {
				instance: this,
				active: this.active
			});
		}
	}

	_onIgnoredClick(event) {
		var
			target = $(event.currentTarget),
			href = target.attr('href'),
			button = this._buttons.filter('[href="' + href + '"]')
		;

		if (button.length > 0) {
			this.active = this._buttons.index(button[0]);
		}
	}

	_onKeydown(event) {
		var index = this._buttons.index(event.currentTarget);

		if (event.altKey) {
			// do nothing...
			return;
		}

		switch (event.which) {
			case KEY_ENTER:
			case KEY_SPACE:
				event.preventDefault();

				if (this.isMultiselectable) {
					this._toggle(index);
				} else {
					this.active = index;
				}
				break;
			case KEY_ARROW_LEFT:
			case KEY_ARROW_UP:
				event.preventDefault();
				this._focusButtonAt(index - 1 , -1);

				break;
			case KEY_ARROW_RIGHT:
			case KEY_ARROW_DOWN:
				event.preventDefault();

				this._focusButtonAt(index + 1, 1);
				break;
			case KEY_END:
				event.preventDefault();

				this._focusButtonAt(this._buttons.length - 1, -1);
				break;
			case KEY_HOME:
				event.preventDefault();

				this._focusButtonAt(0, 1);
				break;
		}
	}

	_onFocus(event) {
		var button = $(event.currentTarget);
		button.attr(ATTR_ARIA_SELECTED, event.type === 'focus');
	}

}

export default View;
