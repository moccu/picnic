import $ from 'jquery';
import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';
import Template from 'picnic/clickblocker/views/Clickblocker.html!text';

var
	template = _.template(Template),
	SELECTOR_CONTENT = '.clickblocker',
	ANIMATION_DURATION = 300
;

class View extends BaseView {

	constructor(options) {
		super(options);

		this._key = options.key;
	}

	getKey() {
		return this._key;
	}

	render() {
		this._content = $(template({
				key: this.getKey()
			}))
			.filter(SELECTOR_CONTENT)
			.hide();

		return this;
	}

	open() {
		this._content
			.appendTo(this.$el)
			.fadeIn(ANIMATION_DURATION);
	}

	close(destroy) {
		var self = this;

		this._content.fadeOut(ANIMATION_DURATION, function() {
			if (destroy) {
				self._content.remove();
			}
		});
	}

	destroy() {
		this.close(true);
	}
}

export default View;
