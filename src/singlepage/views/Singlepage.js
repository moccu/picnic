import $ from 'jquery';
import _ from 'underscore';
import BaseView from 'picnic/core/views/Base';
import Link from 'picnic/singlepage/utils/Link';


var
	DEFAULTS = {
		global: window
	}
;


class View extends BaseView {

	constructor(options) {
		super($.extend({}, DEFAULTS, options));
		_.bindAll(this, '_onClick');
	}

	render() {
		this.$el.on('click', this.options.observeSelector, this._onClick);
		return this;
	}

	destroy() {
		this.$el.off('click', this.options.observeSelector, this._onClick);
		super.destroy();
	}

	replace(contents) {
		var container = this.$el.find(this.options.updateSelector);
		container.children().remove();
		container.append(contents);
	}

	_onClick(event) {
		var link = new Link(event.currentTarget);

		// Test if protocol, hostname, port is equal to the current location...
		// Test if link opens as target="_self"...
		// Test if link is no download...
		if (
			link.isSameProtocol && link.isSameHostname && link.isSamePort &&
			link.isTargetSelf &&
			!link.isDownload
		) {
			// In this case we are shure to use a navigation inside the current
			// website...

			// For a "singlepage"-navigation the pathname or the search params
			// must differ to the current location...
			if (!link.isSamePathname || !link.isSameSearch) {
				event.preventDefault();
				this.context.dispatch(this.options.eventName, {href: link.href});
				return;
			}

			// When pathname, search params and hash matches the current
			// location we can stop the browsers default behaviour to navigate...
			if (link.isSamePathname && link.isSameSearch && link.isSameHash) {
				event.preventDefault();
				return;
			}
		} else if (
			!link.isSameHostname &&
			link.isTargetSelf &&
			!link.isJavaScript &&
			!link.isMailTo
		) {
			event.preventDefault();
			this.options.global.open(link.href);
		}
	}

}

export default View;
