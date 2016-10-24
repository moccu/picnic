import $ from 'jquery';
import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';


var
	DEFAULTS = {
		namespace: 'tabfocus:views',
		classFocus: 'is-focused',
		selectorFocusable: 'a, button, [tabindex]'
	}
;


class View extends BaseView {

	constructor(options) {
		super($.extend({}, DEFAULTS, options));

		_.bindAll(
			this,
			'_onFocusIn',
			'_onFocus'
		);
	}

	render() {
		this.$el.find(this.options.selectorFocusable).on('focusin.tabfocus', this._onFocusIn);

		return this;
	}

	destroy() {
		if (this.options) {
			this.$el.off('focusin.tabfocus', this.options.selectorFocusable, this._onFocusIn);
			this.$el.off('focusin.tabfocus mouseup.tabfocus', this.options.selectorFocusable, this._onFocus);
		}
		super.destroy();
	}

	_onFocusIn(event) {
		if (this._lastFocused) {
			this._lastFocused.removeClass(this.options.classFocus);
			this._lastFocused = null;
		}

		$(event.currentTarget).one('keyup.tabfocus mouseup.tabfocus', this._onFocus);
	}

	_onFocus(event) {
		// if tabindex is explicite set to '-1', tabbing should not be allowed
		if ($(event.currentTarget).attr('tabindex') !== '-1' && event.type === 'keyup') {
			this._lastFocused = $(event.currentTarget).addClass(this.options.classFocus);
		}

		$(event.currentTarget).off('keyup.tabfocus mouseup.tabfocus');
	}
}

export default View;
