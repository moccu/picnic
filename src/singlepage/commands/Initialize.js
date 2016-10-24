import $ from 'jquery';
import Initialize from 'picnic/core/commands/Initialize';
import Navigate from 'picnic/singlepage/commands/Navigate';
import Service from 'picnic/singlepage/services/History';
import View from 'picnic/singlepage/views/Singlepage';
import settings from 'picnic/singlepage/settings';

/*
 * The singlepage module allows a *webapp like* navigation between two urls.
 * This module watches all links on a webpage. Once a user clicks on a link,
 * this module fetches the requested content behind the links href and replaces
 * the old content with the new fetched one. This module also handles the users
 * navigation history by using `pushState` and `popState`.
 *
 * To destroy the old modules of the previous url and initialze new modules from
 * the fetched url, the singlepage fires related events which are intend to wire
 * [Initialize](#initialize-command) and [Destroy](#destroy-command) commands
 * on. By default those eventNames are the same as the the
 * `core/app/Application` module uses to initialize all modules on startup.
 * These eventNames are `'application:start'` to initialize modules and
 * `'application:stop'` to destroy. The singlepage navigation passes a
 * `root` DOM-node of the content tree as eventData which should be used
 * to only destroy and re-initialze this area. This `root` property will be
 * respected by the picnic's [Initialize](#initialize-command) and
 * [Destroy](#destroy-command) commands.
 *
 * To get a nice animation between the content changes, you can use
 * transitions. Transitions are Backbone.Geppetto commands. Once they are
 * executed by an event from the singlepage module, they should respond with the
 * same eventName including the `':done'`-postfix as they are called, when they
 * are done to continue the navigation process. To simplify the writing of a
 * transition, extend from the default `Translate` command in
 * `picnic/singlepage/commands/Translate`. You can perform all your animations
 * inside the `execute()`-method and once you're done, call the `done()`-method
 * to allow the singlepage module to continue. Transitions are called twice:
 * on beginning of a navigation and at the end of a navigation – this allows you
 * to define in- and out- animations. There are multiple informations passed
 * into a translate command:
 *
 * * `translate` – tells if the transition type is `'in'` or `'out'` (start and end of a navigation).
 * * `direction` – informs about the direction of a history change. When the user navigates back in the history, the transition will get `'backward'`, otherwise `'forward'`.
 * * `link` – is the target location where to navigate.
 * * `title` – is the current title of the page. This value may differ between in- and out-transition.
 *
 * The singlepage module comes with default settings. These settings can be
 * changed by configuring a settings block using the `'singlepage:settings'` key
 * on the geppetto context (see example). These are the properties which can be
 * changed:
 *
 * * `selectorView` – is the selector where the singlepage module should observe for user's navigation attempts. By default the value is set to `'body'` which allows to check the whole visible area of a website.
 * * `selectorUpdate` – is the ID selector of the content which sould be replaced. Usually it's the main content. By default the value is set to `'#main'`.
 * * `selectorObserve` – is the selector of link elements inside the `selectorView`. By default the selector watches all `<a>`-tags excluding those ones which have the classname `.no-singlepage`. So the default value looks like: `'a:not(.no-singlepage)'`.
 * * `eventNameInitialize` – is the eventName which will be used to initialize new modules in the replaced content area. By default the value is set to `'application:start'`.
 * * `eventNameDestroy` – is the eventName which will be used to destroy old modules from the previous content area. By default the value is set to `'application:stop'`.
 * * `translateIn` – is the class reference for the in-transition between each navigation.
 * * `translateOut` – is the class reference for the out-transition between each navigation.
 *
 * **Attention:**
 * *To keep your application performant, you must pay attention to destroy your
 * unuses modules between each navigation. Pay also attention to not initialize
 * each module more than once when not using the picnic's `Initialize` command.
 * Keep track of all your command and value wirings when calling an initialize
 * command more than one.*
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
