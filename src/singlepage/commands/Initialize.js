import $ from 'jquery';
import Initialize from 'picnic/core/commands/Initialize';
import Navigate from 'picnic/singlepage/commands/Navigate';
import Service from 'picnic/singlepage/services/History';
import View from 'picnic/singlepage/views/Singlepage';
import settings from 'picnic/singlepage/settings';

/*
 * The singlepage module allows a webapp-like navigation between two urls.
 * This module watches all links on a webpage. Once a user clicks on a link,
 * this module fetches the requested content behind the link's href and replaces
 * the old page content with the new fetched one. This module also handles the
 * user's navigation history by using `pushState` and `popState`.
 *
 * To destroy the old modules of the previous url and intitialize new modules
 * from the fetched url, the singlepage fires related events which are intended
 * to execute [Initialize](#initialize-command) and [Destroy](#destroy-command)
 * commands. By default those eventNames are the same as the
 * `core/app/Application` module uses to initialize all modules on startup.
 * These eventNames are `'application:start'` to initialize modules and
 * `'application:stop'` to destroy. The singlepage navigation passes a
 * `root` DOM-node of the content tree as eventData who's sole purpose is to
 * destroy and re-initialize this area. To benefit from this behaviour, use
 * picnic's [Initialize](#initialize-command) and [Destroy](#destroy-command)
 * commands which support this by default.
 *
 * To get a nice animation between the content changes, you can use
 * transitions. Transitions are backbone.geppetto commands. When a transition is
 * triggered, the singlepage navigation process is blocked until the transition
 * process is finished. This is signaled from the executed transition by
 * re-triggering the eventName with a ':done' postfix. To simplify the writing
 * of a transition, extend from the default `Translate` command in
 * `picnic/singlepage/commands/Translate`. You can perform all your animations
 * inside the `execute()` method and once you are done, call the `done()` method
 * to allow the singlepage module to continue. Transitions are called twice:
 * at the start of a navigation and at the end of a navigation – this allows you
 * to define in and out animations. There are multiple properties passed
 * to a translate command by the triggering eventData:
 *
 * * `translate` – transition type `'in'` or `'out'` (start and end of a navigation).
 * * `direction` – direction of the user's history change. When the user navigates back in the history, the transition will set to `'backward'`, otherwise `'forward'`.
 * * `link` – target location where to navigate.
 * * `title` – current page title. This value may differ between in and out transition.
 *
 * The singlepage module comes with default settings. These settings can be
 * changed by configuring a settings block using the `'singlepage:settings'` key
 * on the geppetto context (see example). These are the properties which can be
 * changed:
 *
 * * `selectorView` – selector where the singlepage module will observe user's navigation attempts. By default the value is set to `'body'` which allows to check the whole visible area of a website.
 * * `selectorUpdate` – ID selector of the content which will be replaced – usually the main page content. By default the value is set to `'#main'`.
 * * `selectorObserve` – selector of link elements inside the `selectorView`. By default the selector watches all `<a>` tags excluding those which have the classname `.no-singlepage`. The default value is `'a:not(.no-singlepage)'`.
 * * `eventNameInitialize` – eventName to trigger the initialization of new modules in the replaced content area. By default the value is set to `'application:start'`.
 * * `eventNameDestroy` – eventName to trigger the destruction of old modules from the previous content area. By default the value is set to `'application:stop'`.
 * * `translateIn` – class reference for the in-transition between each navigation
 * * `translateOut` – class reference for the out-transition between each navigation
 *
 * **Attention:**
 * *To keep your application performant, you should destroy your unused modules
 * between each navigation process. Pay also attention not to initialize
 * each module more than once when not using picnic's `Initialize` command.
 * Keep track of your command and value wiring when calling an initialize
 * command more than once.*
 *
 * **Events**
 *
 * * `singlepage:navigate` – is triggered when a user clicks on a link
 * * `singlepage:navigate:init` – is triggered when the navigation process initialize (before transition in)
 * * `singlepage:navigate:start` – is triggered when the navigation process starts to update the content (after transition in, only fired when the request was successful)
 * * `singlepage:navigate:end` – is triggered when the navigation process has completed the content update (before transiton out, only fired when the request was successful)
 * * `singlepage:navigate:done` – is triggered when the navigation process is completed
 * * `singlepage:navigate:fail` – is triggered when the navigation process fails (e.g. 404 or 500 status codes)
 *
 * @class Singlepage
 * @example
 *		import Singlepage from 'picnic/singlepage/commands/Initialize';
 *		import ExampleInitialize from 'app/example/commands/Initialize';
 *		import ExampleDestroy from 'app/example/commands/Destroy';
 *
 *		...
 *
 *		context.wireCommands({
 *			'application:start': [
 *				Singlepage,
 *				ExampleInitialize
 *			],
 *			'application:stop': [
 *				ExampleDestroy
 *			]
 *		});
 *
 * @example
 *		context.wireValue('singlepage:settings', {
 *			selectorView: 'body',
 *			selectorUpdate: '#main',
 *			selectorObserve: 'a:not(.no-singlepage)',
 *
 *			eventNameInitialize: 'application:start',
 *			eventNameDestroy: 'application:stop',
 *
 *			translateIn: Translate,
 *			translateOut: Translate
 *		});
 *
 * @example
 *		import $ from 'jquery';
 *		import Translate from 'picnic/singlepage/commands/Translate';
 *
 *		class Fade extends Translate {
 *			execute() {
 *				var fade = (this.eventData.translate === 'in') ? 'fadeOut' : 'fadeIn';
 *				$('#main')[fade](
 *					500,
 *					this.done.bind(this)
 *				);
 *			}
 *		}
 *
 *		...
 *
 *		context.wireValue('singlepage:settings', {
 *			translateIn: Fade,
 *			translateOut: Fade
 *		});
 *
 */
class Command extends Initialize {

	preExecute() {
		this._settings = $.extend({}, settings.defaults);

		// Load possible custom settings:
		if (this.context.hasWiring(settings.namespaceSettings)) {
			this._settings = $.extend(this._settings, this.context.getObject(settings.namespaceSettings));
		}
	}

	get settings() {
		return {
			namespace: settings.namespaceViews,
			selector: this._settings.selectorView,
			viewclass: View,
			viewoptions: {
				observeSelector: this._settings.selectorObserve,
				updateSelector: this._settings.selectorUpdate,
				eventName: this._settings.eventNameNavigate
			}
		};
	}

	execute() {
		// Check that the singlepage feature is only initialized once...
		if (!this.context.hasWiring(settings.namespaceService)) {
			// Check if functionality is supported by browser...
			if (Service.isSupported()) {
				super.execute();
			}
		}
	}

	postExecute() {
		this.context.wireCommand(this._settings.eventNameNavigate, Navigate);
		this.context.wireCommand(this._settings.eventNameTranslateIn, this._settings.translateIn);
		this.context.wireCommand(this._settings.eventNameTranslateOut, this._settings.translateOut);
		this.context.wireValue(settings.namespaceService, new Service({
			context: this.context,
			eventName: this._settings.eventNameNavigate
		}));
	}

}

export default Command;
