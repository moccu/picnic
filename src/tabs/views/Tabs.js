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
	ATTR_ARIA_DISABLED = 'aria-disabled',
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
		selected: 0,
		toggleable: false,
		multiselectable: false,
		classSelected: 'is-selected',
		classCollapsed: 'is-collapsed',
		classDisabled: 'is-disabled'
	}
;

/**
 * A module to create an accessible tab navigation based on minimal and fallback
 * compatible markup. An instance of the tabs module allows the user to navigate
 * via arrow keys, home and end key as well using enter or space key to toggle
 * each panels visibility. By default there are only three classes to set into
 * your stylesheets to enable the visual changes:
 *
 * * `.is-collapsed` hides closed tab panels
 * * `.is-selected` marks the selected tab button
 * * `.is-disabled` use this class to visually disable a tab
 *
 * Tabs and accordions have quite the same functionality. They only differ in
 * the layout of their markup. Take a look at the second example how to enable
 * an accordion behaviour.
 *
 * @class Tabs
 * @example
 * 		<!-- Usage as tabs module -->
 * 		<ul class="tabs">
 *			<li><a href="#tab1" title="Open tab 1">Tab 1</a></li>
 *			<li><a href="#tab2" title="Open tab 2">Tab 2</a></li>
 *			<li class="is-disabled"><a href="#tab3" title="Open tab 3">Tab 3 (disabled)</a></li>
 * 		</ul>
 *
 * 		<div id="#tab1"><h2>Tab 1 content</h2></div>
 * 		<div id="#tab2"><h2>Tab 2 content</h2></div>
 * 		<div id="#tab3"><h2>Tab 3 content</h2></div>
 *
 *		// Javascript:
 *		import Tabs from 'picnic/tabs/views/Tabs';
 *
 *		var tabs = new Tabs({
 *			el: $('.tabs')[0],
 *			context: app.context
 *		}).render();
 *
 * @example
 * 		<!-- Usage as accordion module -->
 * 		<div class="accordion">
 * 			<h2><a href="#section1" title="Open section 1">Section 1</a></h2>
 * 			<div id="section1"><p>Section 1</p></div>
 *			<h2><a href="#section2" title="Open section 2">Section 2</a></h2>
 * 			<div id="section2"><p>Section 2</p></div>
 *			<h2><a href="#section3" title="Open section 3">Section 3</a></h2>
 * 			<div id="section3"><p>Section 3</p></div>
 * 		</div>
 *
 *		// Javascript:
 *		import Tabs from 'picnic/tabs/views/Tabs';
 *
 *		var accordion = new Tabs({
 *			el: $('.accordion')[0],
 *			context: app.context,
 *			toggleable: true
 *		}).render();
 */
class View extends BaseView {

	/**
	 * Creates an instance of the view.
	 *
	 * @constructor
	 * @param {object} options The settings for the view
	 * @param {object} options.context The reference to the backbone.geppetto context
	 * @param {object} options.el The element reference for a backbone.view
	 * @param {element|$element} options.root A reference for the view to look up for tab panels. By default this is undefined which means the lookup will be the whole DOM.
	 * @param {string} options.selectorButton is the selector for tab buttons
	 * @param {number} options.selected is the initial selected tab index. Default is 1
	 * @param {boolean} options.toggleable defines if a tabs state is toggleable between selected and not. This is mostly required for accordion behaviours. Default is false
	 * @param {boolean} options.multiselectable allows the activation of more than one tabs. Default is false
	 * @param {string} options.classSelected the classname to use for selected tab buttons. Default value is 'is-selected'
	 * @param {string} options.classCollapsed the classname to use for collapsed tab panels. Default value is 'is-collapsed'
	 * @param {string} options.classDisabled the classname to use for disabled tab elements. Default value is 'is-disabled'
	 */
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

	/**
	 * Gets and sets the selected index of tabs.
	 *
	 * @return {number} index of tab
	 */
	get selected() {
		return this._selected;
	}

	set selected(value) {
		if (this.isDisabledTabAt(value)) {
			return;
		}

		if (this.isMultiselectable) {
			this.toggle(value, !this.isSelected(value));
		} else {
			if (this.options.toggleable && value === this._selected) {
				value = -1;
			}

			if (value !== this._selected && value < this._buttons.length) {
				this._buttons.each(index => {
					this.toggle(index, value === index);
					this._selected = value;
				});
			}
		}
	}

	/**
	 * Retuns if the tabs module is multiselectable.
	 *
	 * @return {boolean} defines the multiselectable state
	 */
	get isMultiselectable() {
		// This caches the return value of the initial call:
		this._isMultiselectable = this._isMultiselectable || (function() {
			return this.options.multiselectable ||
				(this.$el.attr(ATTR_ARIA_MULTISELECTABLE) || '').toLowerCase() === 'true';
		}.bind(this))();

		return this._isMultiselectable;
	}

	/**
	 * This renders the content of this view and enables all features.
	 *
	 * @return {object} The instance of this view
	 */
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

		this.toggleAll(false);
		this.selected = this.options.selected;

		return this;
	}

	/**
	 * Removes all inner references and eventlisteners.
	 */
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

	/**
	 * Returns the jQuery reference of a tab element at a given index.
	 *
	 * @param {number} index is the index of the returned tab element.
	 * @return {$element} is the elements jQuery reference.
	 */
	getTabAt(index) {
		return this._buttons.eq(index).parent();
	}

	/**
	 * Returns the jQuery reference of a button element inside a tab at a
	 * given index.
	 *
	 * @param {number} index is the index of the returned button element.
	 * @return {$element} is the elements jQuery reference.
	 */
	getButtonAt(index) {
		return this._buttons.eq(index);
	}

	/**
	 * Enables a tab at the given index.
	 *
	 * @param {number} index is the index of the tab to be enabled
	 */
	enableTabAt(index) {
		this._disableTabAt(index, false);
	}

	/**
	 * Disables a tab at the given index. The tab and it's tab panels content
	 * will not be accessible until its enabled again.
	 *
	 * @param {number} index is the index of the tab to be disabled.
	 */
	disableTabAt(index) {
		this._disableTabAt(index, true);
	}

	/**
	 * Returns if a tab is disabled at a given index.
	 *
	 * @param {number} index is the index of the tab to check
	 * @return {boolean} describes if the tab is disabled or not
	 */
	isDisabledTabAt(index) {
		if (index < 0 || index >= this._buttons.length) {
			return false;
		}

		return this.getTabAt(index)
			.hasClass(this.options.classDisabled);
	}

	/**
	 * Returns if the tab at the given index is selected (not collapsed).
	 *
	 * @param {number} index is the index of the tab to check
	 * @return {boolean} describes if the tab is selected (not collapsed)
	 */
	isSelected(index) {
		if (index < 0 || index >= this._buttons.length) {
			return false;
		}

		return this.getTabAt(index)
			.hasClass(this.options.classSelected);
	}

	/**
	 * This toggles the selected state of a tab at a given index.
	 *
	 * @param {number} index is the index of the tab
	 * @param {boolean} isSelected describes if the tab should be selected
	 */
	toggle(index, isSelected) {
		var
			button = this._buttons.eq(index),
			buttonId = button.attr('id') || this.getUniqueId(true),
			selector = button.attr('href'),
			panel = $(selector, this.options.root),
			tab = button.parent()
		;

		if (!_.isBoolean(isSelected)) {
			// If isSelected is not defined, this is the toggling feature...
			isSelected = !this.isSelected(index);
		}

		tab
			.toggleClass(this.options.classSelected, isSelected);

		button
			.attr('id', buttonId)
			.attr(ATTR_ROLE, 'tab')
			.attr(ATTR_ARIA_EXPANDED, isSelected)
			.attr(ATTR_ARIA_CONTROLS, selector.replace('#', ''));

		panel
			.attr(ATTR_ROLE, 'tabpanel')
			.attr(ATTR_AIRA_HIDDEN, (!isSelected).toString())
			.attr(ATTR_AIRA_LABELLEDBY, buttonId)
			.toggleClass(this.options.classCollapsed, !isSelected);

		if (isSelected) {
			this._selected = index;
		}
	}

	/**
	 * This toggles selected states of all existing tabs.
	 *
	 * @param {boolean} isSelected describes if the tab schould be selected
	 */
	toggleAll(isSelected) {
		this._buttons.each(index => {
			this.toggle(index, isSelected);
		});
	}

	_disableTabAt(index, disabled) {
		this.getTabAt(index).toggleClass(this.options.classDisabled, disabled);

		if (disabled) {
			this.getButtonAt(index)
				.attr(ATTR_ARIA_DISABLED, 'true')
				.attr(ATTR_TABINDEX, '-1');
		} else {
			this.getButtonAt(index)
				.removeAttr(ATTR_ARIA_DISABLED)
				.removeAttr(ATTR_TABINDEX);
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
			this.selected = index;

			this.trigger('change', {
				instance: this,
				selected: this.selected
			});

			this.context.dispatch('tabs:change', {
				instance: this,
				selected: this.selected
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
			this.selected = this._buttons.index(button[0]);
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
					this.toggle(index);
				} else {
					this.selected = index;
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
		// Toggle selected state depending on event type:
		// * event.type === 'focus' ---> selected
		// * event.type === 'blur' ---> not selected
		button.attr(ATTR_ARIA_SELECTED, event.type === 'focus');
	}

}

export default View;
