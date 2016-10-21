import $ from 'jquery';
import _ from 'underscore';
import Link from 'picnic/singlepage/utils/Link';
import settings from 'picnic/singlepage/settings';


var
	SELECTOR_SCROLLTOP = 'html, body',
	XHR_STATUS_SUCCESS = 'success',
	SCROLL_TOP_DURATION = 500
;


class Command {

	execute() {
		this._settings = $.extend({}, settings.defaults);

		// Load possible custom settings:
		if (this.context.hasWiring(settings.namespaceSettings)) {
			this._settings = $.extend(this._settings, this.context.getObject(settings.namespaceSettings));
		}

		// Inform about a upcoming navigation initialization...
		this.context.dispatch(this.eventName + ':init', $.extend({}, this.eventData));

		// Open clickblocker to prevent further clicking:
		this.context.dispatch('clickblocker:open', {key: settings.namespace});

		// Fetch new content from url from a sertain container:
		this._container = $('<div />');
		this._container.load(
			this.eventData.href + ' ' + this._settings.selectorUpdate,
			$.proxy(this._onResponse, this)
		);
	}

	_onResponse(response, status) {
		var
			href = this.eventData.href,
			link = new Link(href),
			target = $(this._settings.selectorUpdate),
			container = this._container.children().eq(0),
			contents = container.contents(),
			title = document.title,
			foundScripts = [],
			foundStyles = [],
			service,
			views
		;

		if (status === XHR_STATUS_SUCCESS && contents.length > 0) {
			service = this.context.getObject(settings.namespaceService);
			views = this.context.getObject(settings.namespaceViews);

			// Parse contents from document:
			$.parseHTML(response, document, true).forEach(node => {
				if (node instanceof window.HTMLElement) {
					switch (node.tagName.toLowerCase()) {
						case 'title':
							// Load new document title from loaded dom string...
							title = node.innerHTML;
							break;

						case 'script':
							// Perform a lookup for the javascript
							// block(s), which should be defined
							// in the root of the document. When found the
							// content should be applied before
							// executing/starting the new modules via
							// initialize commands by
							// calling the initialize-event later in
							// this flow...
							if (_.contains(this._settings.scriptIds, node.id)) {
								foundScripts.push(node.innerHTML);
							}
							break;

						case 'link':
							// Perform a lookup for the <link>-style, which
							// should be defined in the root of the document.
							// When found the styles will be added to the <head>
							// before the new modules will be initialize by
							// calling the initialize-event later in this flow...
							if (_.contains(this._settings.styleIds, node.id)) {
								foundStyles.push(node);
							}
							break;

						case 'style':
							// Perform a lookup for the <style> elements,
							// which should be defined
							// in the root of the document. When found the
							// styles will be added to the <head>
							// before the new modules will be initialize by
							// calling the initialize-event later in this flow...
							if (_.contains(this._settings.styleIds, node.id)) {
								foundStyles.push(node);
							}
							break;
					}
				}
			});

			// Inform about an upcoming navigation change...
			this.context.dispatch(this.eventName + ':start', $.extend({
				title: title
			}, this.eventData));

			// Destroy old modules from target:
			this.context.dispatch(this._settings.eventNameDestroy, {root: target});

			// Replace contents in target:
			_.each(views, function(view) { view.replace(contents); }, this);

			// Update current url:
			// Skip this when 'keepState' was set. This is normally the case
			// when a history change by the user (browser-back or -forward) was
			// performed. In this case we won't change browser's history...
			if (!this.eventData.keepState) {
				service.navigate(href, title);
			} else {
				//...but we need to explicitly set the (new) document title...
				document.title = title;
			}

			// Load (reload) scripts
			_.each(foundScripts, script => {
				if (typeof script === 'string') {
					eval(script); // jshint ignore:line
				}
			});

			// Append (reappend) styles
			_.each(foundStyles, style => {
				document.head.appendChild(style);
			});

			// Scroll viewport to top or to the position of the requested
			// deeplinked element...
			this._scrollTo(link);

			// Initialize new modules in target:
			this.context.dispatch(this._settings.eventNameInitialize, {root: target});

			// Inform about a final navigation change...
			this.context.dispatch(this.eventName + ':end', $.extend({
				title: title
			}, this.eventData));
		}

		// Remove clickblocker for upcoming user interactions:
		this.context.dispatch('clickblocker:close', {key: settings.namespace});

		// Inform about the end of navigation...
		this.context.dispatch(this.eventName + ':done', $.extend({}, this.eventData));
	}

	_scrollTo(link) {
		var
			top = 0,
			target
		;

		if (link.hasHash) {
			try {
				target = $(link.hash);
			} catch(error) {}

			if (target && target.length === 1) {
				top = target.offset().top;
			}
		}

		$(SELECTOR_SCROLLTOP).animate({scrollTop: top}, {duration: SCROLL_TOP_DURATION});
	}

}

export default Command;
