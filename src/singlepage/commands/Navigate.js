import $ from 'jquery';
import _ from 'underscore';
import Link from 'picnic/singlepage/utils/Link';
import settings from 'picnic/singlepage/settings';


var
	XHR_STATUS_SUCCESS = 'success',
	TRANSLATE_FORWARD = 'forward',
	TRANSLATE_BACKWARD = 'backward'
;


class Command {

	execute() {
		this._link = new Link(this.eventData.href);
		this._title = document.title;

		// Use an immediate resolved deferred object to simplify the workflow of
		// this command...
		(new $.Deferred()).resolve()

			// Setup default and custom settings...
			.then(this._loadSettings.bind(this))

			// Inform about a upcoming navigation initialization...
			.then(this._notifyInit.bind(this))

			// Translate in (add some effect between url change)...
			.then(this._translateIn.bind(this))

			// Fetch content from reqeusted href...
			.then(this._request.bind(this))

			// Handle failed request...
			.fail(function() {
				// @TODO: is there something to do?
			})

			// Parse contents from response...
			.then(this._parse.bind(this))

			// Inform about an upcoming navigation change...
			.then(this._notifyStart.bind(this))

			// Destroy old modules from target...
			.then(this._destroyOldModules.bind(this))

			// Replace contents in target...
			.then(this._replaceLoadedContents.bind(this))

			// Update the user's navigation history
			.then(this._updateHistory.bind(this))

			// Load (reload) scripts...
			.then(this._insertScripts.bind(this))

			// Append (reappend) styles
			.then(this._insertStyles.bind(this))

			// Initialize new modules in target:
			.then(this._initializeNewModules.bind(this))

			// Inform about a final navigation change...
			.then(this._notifyEnd.bind(this))

			// Translate out (add some effect between url change)...
			.always(this._translateOut.bind(this))

			// Inform about the end of navigation...
			.always(this._notifyDone.bind(this));
	}

	_loadSettings() {
		this._settings = $.extend({}, settings.defaults);

		// Load possible custom settings:
		if (this.context.hasWiring(settings.namespaceSettings)) {
			this._settings = $.extend(this._settings, this.context.getObject(settings.namespaceSettings));
		}
	}

	_notifyInit() {
		this.context.dispatch(this.eventName + ':init', $.extend({

		}, this.eventData));
	}

	_notifyStart() {
		this.context.dispatch(this.eventName + ':start', $.extend({
			title: this._title
		}, this.eventData));
	}

	_notifyEnd() {
		this.context.dispatch(this.eventName + ':end', $.extend({
			title: this._title
		}, this.eventData));
	}

	_notifyDone() {
		this.context.dispatch(this.eventName + ':done', $.extend({

		}, this.eventData));
	}

	_translate(translate, eventName) {
		var
			deferred = new $.Deferred(),
			direction = this.eventData.direction || 1
		;

		direction = direction / Math.abs(direction);
		direction = (direction >= 0) ? TRANSLATE_FORWARD : TRANSLATE_BACKWARD;

		this.context.vent.once(eventName + ':done', function() {
			deferred.resolve();
		});
		this.context.dispatch(eventName, {
			translate: translate,
			direction: direction,
			link: this._link,
			title: this._title
		});

		return deferred;
	}

	_translateIn() {
		return this._translate('in', this._settings.eventNameTranslateIn);
	}

	_translateOut() {
		return this._translate('out', this._settings.eventNameTranslateOut);
	}

	_request() {
		var deferred = new $.Deferred();

		// Fetch new content from url from a certain container:
		this._container = $('<div />');
		this._container.load(
			this.eventData.href + ' ' + this._settings.selectorUpdate,
			function(response, status) {
				this._contents = this._container.children().eq(0).contents();
				this._target = $(this._settings.selectorUpdate);

				if (status === XHR_STATUS_SUCCESS && this._contents.length > 0) {
					deferred.resolve(response, status);
				} else {
					deferred.reject(response, status);
				}
			}.bind(this)
		);

		return deferred;
	}

	_parse(response) {
		$.parseHTML(response, document, true).forEach(node => {
			if (node instanceof window.HTMLElement) {
				switch (node.tagName.toLowerCase()) {
					case 'title':
						// Load new document title from loaded dom string...
						this._title = node.innerHTML;
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
							this._foundScripts = this._foundScripts || [];
							this._foundScripts.push(node.innerHTML);
						}
						break;

					case 'link':
						// Perform a lookup for the <link>-style, which
						// should be defined in the root of the document.
						// When found the styles will be added to the <head>
						// before the new modules will be initialize by
						// calling the initialize-event later in this flow...
						if (_.contains(this._settings.styleIds, node.id)) {
							this._foundStyles = this._foundStyles || [];
							this._foundStyles.push(node);
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
							this._foundStyles = this._foundStyles || [];
							this._foundStyles.push(node);
						}
						break;
				}
			}
		});
	}

	_destroyOldModules() {
		this.context.dispatch(this._settings.eventNameDestroy, {
			root: this._target
		});
	}

	_initializeNewModules() {
		this.context.dispatch(this._settings.eventNameInitialize, {
			root: this._target
		});
	}

	_replaceLoadedContents() {
		_.each(this.context.getObject(settings.namespaceViews), function(view) {
			view.replace(this._contents);
		}, this);
	}

	_updateHistory() {
		// Update current url:
		// Skip this when 'keepState' was set. This is normally the case
		// when a history change by the user (browser-back or -forward) was
		// performed. In this case we won't change browser's history...
		if (!this.eventData.keepState) {
			this.context
				.getObject(settings.namespaceService)
				.navigate(this.eventData.href, this._title);
		} else {
			//...but we need to explicitly set the (new) document title...
			document.title = this._title;
		}
	}

	_insertScripts() {
		_.each(this._foundScripts, script => {
			if (typeof script === 'string') {
				eval(script); // jshint ignore:line
			}
		});
	}

	_insertStyles() {
		_.each(this._foundStyles, style => {
			document.head.appendChild(style);
		});
	}
}

export default Command;
