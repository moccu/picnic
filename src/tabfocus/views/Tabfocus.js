import $ from 'jquery';
import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';


var
	DEFAULTS = {
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
			'_onFocusOut'
		);
	}

	render() {
		this.$el.find(this.options.selectorFocusable).on('focusin.application', this._onFocusIn);

		return this;
	}

	destroy() {
		if (this.options) {
			this.$el.off('focusin.application', this.options.selectorFocusable, this._onFocusIn);
			this.$el.off('focusin.application mouseup.application', this.options.selectorFocusable, this._onFocusOut);
		}
		super.destroy();
	}

	_onFocusIn(event) {
		if (this._lastFocused) {
			this._lastFocused.removeClass(this.options.classFocus);
			this._lastFocused = null;
		}

		$(event.currentTarget).one('keyup.application mouseup.application', this._onFocusOut);
	}

	_onFocusOut(event) {
		// if tabindex is explicite set to '-1', tabbing should not be allowed
		if ($(event.currentTarget).attr('tabindex') !== '-1' && event.type === 'keyup') {
			this._lastFocused = $(event.currentTarget).addClass(this.options.classFocus);
		}

		$(event.currentTarget).off('keyup.application mouseup.application');
	}
}

export default View;
