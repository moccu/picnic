# picnic

Collection of tiny backbone.geppetto modules and tools to make our live easier.

[![Travis Status](https://travis-ci.org/moccu/picnic.png?branch=master)](https://travis-ci.org/moccu/picnic)
[![David DM Dependencies](https://david-dm.org/moccu/picnic/status.svg)](https://david-dm.org/moccu/picnic)
[![David DM DevDependencies](https://david-dm.org/moccu/picnic/dev-status.svg)](https://david-dm.org/moccu/picnic?type=dev)

## Contents
1. [Modules](#modules)
	* [Clickblocker](#clickblocker)
	* [Destroy-Command](#destroy-command)
	* [Initialize-Command](#initialize-command)
	* [Logger-Util](#logger-util)
	* [Base-View](#base-view)
	* [Collection-View](#collection-view)
	* [Template-View](#template-view)
	* [Mediaplayer](#mediaplayer)
	* [Overlay](#overlay)
	* [Singlepage](#singlepage)
	* [Tabfocus](#tabfocus)
	* [Tabs](#tabs)
	* [Tracking-Bounce](#tracking-bounce)
	* [Tracking-Outbound](#tracking-outbound)
	* [Tracking-Registry](#tracking-registry)
	* [Vimeoplayer](#vimeoplayer)
	* [Youtubeplayer](#youtubeplayer)
2. [Mixins](#mixins)
	* [Base-Mixin](#base-mixin)
	* [UniqueID-Mixin](#uniqueid-mixin)
	* [Visibility-Mixin](#visibility-mixin)
3. [Shortcuts](#shortcuts)
4. [Requirements](#requirements)
5. [Contribution](#contribution)
6. [License](#license)


## Modules





### Clickblocker

A module including commands and view to generate a clickblocker by calling
events on geppetto context.

The initialize command wires two commands to the context to open and close
the clickblocker. The events to trigger those commands are
'clockblocker:open' and 'clockblocker:close'.

This initialize command offers the possibility, when executing this command
more than once, the initialization process itself is performed only once. So
there are no duplicate wirings for the 'clockblocker:open'- or
'clockblocker:close'-event.

`import Clickblocker from 'picnic/clickblocker/commands/Initialize'`



**Example:**

```js
		// Open a clickblocker:
		context.dispatch('clickblocker:open', {
			// The key which is required to open an clickblocker. The key will
			// be used to close the clickblocker. It describes the owner of the
			// clickblocker. This prevents multiple openes and closes of the
			// clickblocker. The key is a string.
			key: 'example-key'
		});
```

**Example:**

```js
		// Close an existing clickblocker
		context.dispatch('clickblocker:close', {
			// The key which was previously used to open the clickblocker is
			// required to close that clickblocker.
			key: 'example-key'
		});
```























### Destroy-Command

A generic command to simply destroy view-modules by defining some
settings. The destroyed view(s) will be removes to a given namespace. When
there are no further views in the given namespace, the namespace will also
be removed from the application context.

The mandatory setting to provide is a *namespace*. To see how to use these
settings take a look at the `get settings`-getter.

When a view (which should be destroyed) has a `destroy()`-function, this
function will be called before the view will be removed from the namespace.

When wiring a destroy-command on a specific event and dispatch that event,
you can pass a "root" element to the event as data to define a specific tree
in the DOM where the views should be destroyed. Take a look at the examples to
see how it works.

`import Destroy-Command from 'picnic/core/commands/Destroy'`



**Example:**

```js
		import Destroy from 'picnic/core/commands/Destroy';

		class Command extends Destroy {

			get settings() {
				return {
					namespace: 'example:views'
				};
			}

		}

		export default Command;
```

**Example:**

```js
		import SpecificDestroy from 'app/example/commands/Destroy';

		// Pass a DOM-element as root in the eventData...
		this.context.wireCommand('example1:event', SpecificDestroy);
		this.context.dispatch('example1:event', {root: document.getElementById('example1')});

		// Pass a jQuery-element as root in the eventData...
		this.context.wireCommand('example2:event', SpecificDestroy);
		this.context.dispatch('example2:event', {root: $('.example2')});

		// Pass a selector-string as root in the eventData...
		this.context.wireCommand('example3:event', SpecificDestroy);
		this.context.dispatch('example3:event', {root: '.example3'});
```






#### `.settings`

This getter returns the settings-object which is mandatory to destroy a view-module. The mandatory setting to provide is a *namespace*.





**Example:**

```js
		get settings() {
			return {
				namespace: 'example:views'
			};
		}
```






#### `.execute()`

Contains all the logic to destroy the module(s). It's not ment to overwrite this function.








#### `.beforeEach(view)`

Overwrite this function to add functionality before each view will be destroyed. If you like to cleanup data or references depending on each view, you can overwrite this function to do this.  You can use this function to stop further actions for this view by returning "false". By default, this function returns "true". This function must return a boolean.


|name|type|description|
|---|---|---|
|`view`|`Backbone.View`|is the view instance before .destroy() will be called on it.|



This function returns:

|type|description|
|---|---|
|`Boolean`|indicates if the view should be destroyed. Default value is &quot;true&quot; which means the view will be destroyed.|





#### `.afterEach(view)`

Overwrite this function to add functionality after each view has been destroyed. If you like to cleanup data or references depending on each view, you can overwrite this function to do this.


|name|type|description|
|---|---|---|
|`view`|`Backbone.View`|is the view instance after .destroy() was be called on it.|







#### `.preExecute()`

Overwrite this function to add functionality before the initialization of the module(s) start...








#### `.postExecute()`

Overwrite this function to add functionality after the initialization of the module(s)...












### Initialize-Command

A generic command to simply initialize view-modules by defining some
settings. The created view(s) will be wired to a given namespace and can be
accessed later on through the application context.

The three mandatory settings to provide are:

* viewclass
* selector
* namespace

To see how to use these settings take a look at the `get settings`-getter.

When wiring a initialize-command on a specific event and dispatch that event,
you can pass a "root" element to the event as data to define a specific tree
in the DOM where the views should be initialized. Take a look at the
examples to see how it works.

**Attention:**
*It's important that the `render()`-function of the configured view-class has
to return a reference to itself.*

`import Initialize-Command from 'picnic/core/commands/Initialize'`



**Example:**

```js
		import Initialize from 'picnic/core/commands/Initialize';
		import View from 'app/modules/example/views/Example';

		class Command extends Initialize {

			get settings() {
				return {
					selector: '.example',
					namespace: 'example:views',
					viewclass: View
				};
			}

		}

		export default Command;
```

**Example:**

```js
		import SpecificInitialize from 'app/example/commands/Initialize';

		// Pass a DOM-element as root in the eventData...
		this.context.wireCommand('example1:event', SpecificInitialize);
		this.context.dispatch('example1:event', {root: document.getElementById('example1')});

		// Pass a jQuery-element as root in the eventData...
		this.context.wireCommand('example2:event', SpecificInitialize);
		this.context.dispatch('example2:event', {root: $('.example2')});
```






#### `.settings`

This getter returns the settings-object which is mandatory to create a view-module. The three mandatory settings to provide are: *viewclass*, *selector* and *namespace*. There is also the possebility to pass multiple other options to the view backbone-view constructor by adding a `viewoptions` property into the settings-object. This property should be defined as object. All properties inside this object are passed into the created backbone-view as options.





**Example:**

```js
		// The basic setup of the settings-getter:
		get settings() {
			return {
				selector: '.example',
				namespace: 'example:views',
				viewclass: View
			};
		}
```

**Example:**

```js
		// You can pass other options to the view by defining the
		// 'viewoptions' property. This can look like:
		get settings() {
			return {
				selector: '.example',
				namespace: 'example:views',
				viewclass: View,
				viewoptions: {
					model: new Backbone.Model(),
					name: 'example'
				}
			};
		}
```






#### `.execute()`

Contains all the logic to initialize the module(s). It's not ment to overwrite this function.








#### `.beforeEach(object, element, index)`

Overwrite this function to add functionality before each view will be created. If you like to modify options for each view depending on element or index, you can overwrite this function to do this.  You can use this function to stop further actions for this element by returning "false". By default, this function returns "true". This function must return a boolean.


|name|type|description|
|---|---|---|
|`object`|`Object`|are the current options which will be passed into the upcoming created view.|
|`element`|`Element`|is the DOM-element on which the view will be rendered.|
|`index`|`Number`|is the current index of all matched DOM-elements.|



This function returns:

|type|description|
|---|---|
|`Boolean`|indicates if the view should be created. Default value is &quot;true&quot; which means the view will be created and rendered.|





#### `.afterEach(view, element, index)`

Overwrite this function to add functionality after each view was created. If you like to call functions or set properties for each new view depending on element or index, you can overwrite this function to do this.  You can use this function to stop further actions for this view by returning "false". By default, this function returns "true". This function must return a boolean.


|name|type|description|
|---|---|---|
|`view`|`Backbone.View`|is the newly create view.|
|`element`|`Element`|is the DOM-element on which the view was created.|
|`index`|`Number`|is the current index of all matched DOM-elements.|



This function returns:

|type|description|
|---|---|
|`Boolean`|indicates if the view should added into the list of created views stored in the given namespace &quot;settings.namespace&quot;. Default value is &quot;true&quot; which means it will be added.|





#### `.preExecute()`

Overwrite this function to add functionality before the initialization of the module(s) start...








#### `.postExecute()`

Overwrite this function to add functionality after the initialization of the module(s)...












### Logger-Util

A generic logger util to print data into the webbrowser's console. The logger
requires a modulename for a better sorting/filtering between logging of
different modules.

`import Logger from 'picnic/core/utils/Logger'`



**Example:**

```js
		import Logger from 'picnic/core/utils/Logger';

		var logger = new Logger({modulename: 'MyInstance'});
		logger.log('Hello world', [1, 2, 3]); // logs: [MyInstance : 1], Hello World, [1, 2, 3]
		logger.error('Something went wrong'); // errors: [MyInstance : 2], Something went wrong
```



#### Constructor `Logger`
Creates an instance of the logger.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view|
|`options.modulename`|`string`|The modulename as a reference which module initiated the logging call.|








#### `.log([args])`

This logs the given arguments including the modulename and a count.


|name|type|description|
|---|---|---|
|`[args]`|`args`|the arguments to log|







#### `.info([args])`

This logs an info the given arguments including the modulename and a count.


|name|type|description|
|---|---|---|
|`[args]`|`args`|the arguments to log as info|







#### `.warn([args])`

This logs a warning the given arguments including the modulename and a count.


|name|type|description|
|---|---|---|
|`[args]`|`args`|the arguments to log as warning|







#### `.error([args])`

This logs an error the given arguments including the modulename and a count.


|name|type|description|
|---|---|---|
|`[args]`|`args`|the arguments to log as error|











### Base-View

A generic view which inherits from the Backbone.View. This view is ment to
be used by all specific views in a project. It stores the references to all
given constructor options in the `.options` property. It also tests for and
stores the reference to the Backbone.Geppetto Context instance.

`import View from 'picnic/core/views/Base'`



**Example:**

```js
		import BaseView from 'picnic/core/views/Base';

		new BaseView({
			el: document.body,
			context: app.context
		}).render();
```



#### Constructor `View`
Creates an instance of this view.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view.|
|`options.context`|`context`|The reference to the backbone.geppetto context.|
|`options.el`|`DOMElement, $Element`|the element reference for a backbone.view.|








#### `.render()`

This renders the content of this view and all models of the collection.




This function returns:

|type|description|
|---|---|
|`view`|is the instance of this view.|





#### `.destroy()`

Destroys this view.












### Collection-View

A generic view to render all models from a collection as list. This
view automaticly updates when the collection changes via add, remove, set or
reset.

The collection view is a simple [Template-View](#Template-View) which renders
by default a `<ul>`-list into the given element. All children (models of the
collection) will be rendered as `<li>`-elements into the list element.

The simplest way to create a child view is to inherit from picnic's
[Template-View](#Template-View)

`import View from 'picnic/core/views/Collection'`



**Example:**

```js
		import Backbone from 'backbone';
		import CollectionView from 'picnic/core/views/Collection';
		import ModelView from 'app/modules/example/views/Model';

		var collection = new Backbone.Collection([
			{id: 1, title: 'Foo'},
			{id: 2, title: 'Bar'}
		]);

		new CollectionView({
			el: document.body,
			context: app.context,
			childviewclass: ModelView,
			collection: collection
		}).render();
```



#### Constructor `View`
Creates an instance of this view.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view.|
|`options.context`|`context`|The reference to the backbone.geppetto context.|
|`options.el`|`element, $element`|the element reference for a backbone.view.|
|`options.childviewclass`|`View`|is the reference to the class of all child elements.|





#### `.childviewclass`

This returns the class reference for all child elements. By default it retuns the `childviewclass` reference which was passed into the constructor of this class. Override this getter setup your inheriting collection views to no pass the reference into the constructor.






#### `.childtagName`

According to the Backbone.View's `tagName` property, it is possible to change the tagName of all child views. By default the child views `el` will be a `<li>` element. Change this getter to change the tagname of each element.






#### `.childCount`

Returns the amount of rendered child views.






#### `.list`

This returns the reference to the list where all child elements will be added to. By default it uses the [Template-View](#Template-View)'s `.content` reference.  You can override this getter to change the reference depending on the complexity of your view's `template`.






#### `.template`

This is the getter for the required underscore.js template string. By default this returns `<ul />`.









#### `.render()`

This renders the content of this view and all models of the collection.




This function returns:

|type|description|
|---|---|
|`view`|is the instance of this view.|





#### `.destroy()`

Destroys this view and all child views.








#### `.getChildview(model)`

Returns the instance of the child view by the given model when rendered. Otherwise it returns `null`.


|name|type|description|
|---|---|---|
|`model`|`model`|is the model to look up for a child view.|



This function returns:

|type|description|
|---|---|
|`view`|is the rendered child view or &#x60;null&#x60;.|





#### `.hasChildview(model)`

Retuns a boolean which identifies if a given model has a already rendered as child view.


|name|type|description|
|---|---|---|
|`model`|`model`|is the model to look up for a child view.|



This function returns:

|type|description|
|---|---|
|`boolean`|identifies if the model has been rendered as child view.|





#### `.createChildview(model)`

Renders a child view by given model into its correct position in the `.list`. This method also returns the rendered child view. If the given model is not in the view's collection, it return `null`.  Pay attention to the collection's comparator function which is responsible for the ordering of the models in the collection and child views in the rendered list.


|name|type|description|
|---|---|---|
|`model`|`model`|is the model to create a view for.|



This function returns:

|type|description|
|---|---|
|`view`|is the rendered child view.|





#### `.destroyChildview(model)`

Destroys and removes the previously rendered child view by the given model.


|name|type|description|
|---|---|---|
|`model`|`model`|is the model which is used as &quot;key&quot; to remove the rendered child view.|



This function returns:

|type|description|
|---|---|
|`view`|is the removed view.|





#### `.onReset()`

The default handler which reacts on `reset` events from the collection.








#### `.onAdd(model)`

The default handler which reacts on `add` events from the collection.


|name|type|description|
|---|---|---|
|`model`|`model`|is the added model.|







#### `.onRemove(model)`

The default handler which reacts on `remove` events from the collection.


|name|type|description|
|---|---|---|
|`model`|`model`|is the removed model.|











### Template-View

A generic template view to render an underscore.js template string. The
rendered template can be accessed by the property "content" ($element)
on each instance of this class.

To render a certain template, simply overwrite the "template" getter inside
the inheriting class and return an underscore template string.

By default, an instance of this view passes the serialized model and
collection into the template context.

`import View from 'picnic/core/views/Template'`



**Example:**

```js
		import Backbone from 'backbone';
		import TemplateView from 'picnic/core/views/Template';
		import Template from 'app/modules/example/views/Example.html!text';

		var model = new Backbone.Model({id: 1});

		new TemplateView({
			el: document.body,
			context: app.context,
			template: Template,
			model: model
		}).render();
```

**Example:**

```js
		import TemplateView from 'picnic/core/views/Template';
		import Template from 'app/modules/example/views/Example.html!text';

		class View extends TemplateView {

			get template() {
				return Template;
			}

		}

		export default View;
```

**Example:**

```js
		import TemplateView from 'picnic/core/views/Template';
		import Template from 'app/modules/example/views/Example.html!text';

		class View extends TemplateView {

			constructor(options) {
				super(options);

				// Re-render content on model change. Pay attention to remove
				// possible eventlisteners from previous content!
				this.model.on('change', () => {
					this.render();
				});
			}

			get template() {
				return Template;
			}

		}

		export default View;
```



#### Constructor `View`
Creates an instance of this view.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view.|
|`options.context`|`context`|The reference to the backbone.geppetto context.|
|`options.el`|`DOMElement, $Element`|the element reference for a backbone.view.|
|`options.template`|`string`|is the underscore.js template string.|
|`options.insertMethod`|`string`|allows to change the default rendering insertMethod. For more details take a look at the &#x60;.insertMethod&#x60; getter of this class.|





#### `.template`

This is the getter for the required underscore.js template string. This getter needs to be overwritten when inheriting from this class.






#### `.data`

This is the getter which retuns the context data for the template. By default it will return an object, with the serialized model and collection data, when passed to the constructor of this instance.  Whether model or collection may be undefined, each property will be null in the returned object.






#### `.target`

This getter returns the target where to add the rendered content. By default it will return the this.$el value of a backbone view. The return value must be a DOM- or jQuery-element.






#### `.insertMethod`

This returns the type of method how to insert the created content to a certain `target`. It supports the following values which map to the identically named jQuery functions:  TemplateView.INSERT_APPENDTO = "appendTo" (default) TemplateView.INSERT_PREPENDTO = "prependTo" TemplateView.INSERT_BEFORE = "insertBefore" TemplateView.INSERT_AFTER = "insertAfter"  All jQuery insertion methods will be used in relation to the `.target` element: content[insertMethod](target)









#### `.render()`

This renders the content of this view.




This function returns:

|type|description|
|---|---|
|`view`|is the instance of this view.|





#### `.destroy()`

Destroys this view.
























### Mediaplayer

This class is intended to be a generic, base class for all mediaplayers
views. It ships the possebility to stop an active player instance of any type
(inherit by this class), when an other player instance starts to play. This
prevents the mix of sounds from (for example) two videos.

An instance of this class got two methods. `.playMedia()` and `.stopMedia()`.
The first should be called in a specific implementation when it starts to
play. This will inform all other instances on the website to stop, if they
are running. To stop, each instance will call it's own `.stopMedia()` method.
The specific implementation needs to overwrite this method and stop the
specific player.

The views [Youtubeplayer](#youtubeplayer) and [Vimeoplayer](#vimeoplayer)
are specific implmentations of this mediaplayer class.

`import View from 'picnic/mediaplayer/views/Mediaplayer'`



**Example:**

```js
		import Mediaplayer from 'picnic/Mediaplayer';

		class HTML5Videoplayer extends Mediaplayer {

			get events() {
				return {
					'click': 'play'
				};
			}

			play() {
				this.el.play();
				this.playMedia();
			}

			stop() {
				this.el.pause();
			}

			stopMedia() {
				this.stop();
			}

		}

		var player = new HTML5Videoplayer({
			el: $('video')[0],
			context: app.context
		}).render();
```



#### Constructor `View`
Creates an instance of the view.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view|
|`options.context`|`object`|The reference to the backbone.geppetto context|
|`options.el`|`object`|The element reference for a backbone.view|








#### `.playMedia()`

Call this method when specific media is started to play.








#### `.stopMedia()`

Overwrite this method and implement behaviour to stop specific player.














### Overlay

A module including commands and view to generate an overlay by calling events
on geppetto context.

The initialize command wires two commands to the context to open and close
the overlay(s). The events to trigger those commands are 'overlay:open' and
'overlay:close'.

This initialize command offers the possibility, when executing this command
more than once, the initialization process itself is performed only once. So
there are no duplicate wirings for the 'overlay:open'- or
'overlay:close'-event.

`import Overlay from 'picnic/overlay/commands/Initialize'`



**Example:**

```js
		// Open an overlay:
		context.dispatch('overlay:open', {
			// The content of the overlay. The content can be type of string
			// which will be converted into a HTMLElement, HTMLElement,
			// jQuery-Element, Class which inherits Backbone.View.
			//
			// This param is required
			//
			// When giving a Class, the class instance will get the context and
			// overlay instance into the contructor as properties of the options
			// parameter.
			content: '<div>Content</div>',
			content: document.getElementById('foo'),
			content: $('#foo'),
			content: FooView,

			// The overlay can be visibility attached to an other content
			// element by setting this property. The reference value can be type
			// of string as a jQuery-Selector, HTMLElement, jQuery-Element.
			reference: '#bar',
			reference: document.getElementById('bar'),
			reference: $('#bar')

			// An optional classname which will be attached to the overlay for
			// better styling options.
			className: 'an-optional-class'

			// Optional clickblocker can be enabled by setting this to 'true'.
			clickblocker: true

			// Optional scrollblocker, will apply an overflow: hidden; style
			// property to the overlay target (default: <body>) by setting this
			// to 'true'.
			scrollblocker: true

			// Optional selector for an overlay content element which labels
			// the overlay. The first matching element will be used
			// as (aria-labelledby) reference for the overlay. By default the
			// selector is "h1, h2, h3, h4, h5, h6".
			selectorLabel: '.aria-label'

			// Optional selector for an overlay content element which describes
			// the overlay. The first matching element will be used
			// as (aria-describedby) reference for the overlay. By default the
			// selector is "p".
			selectorDescription: '.aria-description'

			// Optional close button title
			closeTitle: 'Close this overlay'

			// Optional close button label
			closeLabel: 'Close'
		});
```

**Example:**

```js
		// Close an existing overlay
		context.dispatch('overlay:close');
```

















### Singlepage

The singlepage module allows a webapp-like navigation between two urls.
This module watches all links on a webpage. Once a user clicks on a link,
this module fetches the requested content behind the link's href and replaces
the old page content with the new fetched one. This module also handles the
user's navigation history by using `pushState` and `popState`.

To destroy the old modules of the previous url and intitialize new modules
from the fetched url, the singlepage fires related events which are intended
to execute [Initialize](#initialize-command) and [Destroy](#destroy-command)
commands. By default those eventNames are the same as the
`core/app/Application` module uses to initialize all modules on startup.
These eventNames are `'application:start'` to initialize modules and
`'application:stop'` to destroy. The singlepage navigation passes a
`root` DOM-node of the content tree as eventData who's sole purpose is to
destroy and re-initialize this area. To benefit from this behaviour, use
picnic's [Initialize](#initialize-command) and [Destroy](#destroy-command)
commands which support this by default.

To get a nice animation between the content changes, you can use
transitions. Transitions are backbone.geppetto commands. When a transition is
triggered, the singlepage navigation process is blocked until the transition
process is finished. This is signaled from the executed transition by
re-triggering the eventName with a ':done' postfix. To simplify the writing
of a transition, extend from the default `Translate` command in
`picnic/singlepage/commands/Translate`. You can perform all your animations
inside the `execute()` method and once you are done, call the `done()` method
to allow the singlepage module to continue. Transitions are called twice:
at the start of a navigation and at the end of a navigation – this allows you
to define in and out animations. There are multiple properties passed
to a translate command by the triggering eventData:

* `translate` – transition type `'in'` or `'out'` (start and end of a navigation).
* `direction` – direction of the user's history change. When the user navigates back in the history, the transition will set to `'backward'`, otherwise `'forward'`.
* `link` – target location where to navigate.
* `title` – current page title. This value may differ between in and out transition.

The singlepage module comes with default settings. These settings can be
changed by configuring a settings block using the `'singlepage:settings'` key
on the geppetto context (see example). These are the properties which can be
changed:

* `selectorView` – selector where the singlepage module will observe user's navigation attempts. By default the value is set to `'body'` which allows to check the whole visible area of a website.
* `selectorUpdate` – ID selector of the content which will be replaced – usually the main page content. By default the value is set to `'#main'`.
* `selectorObserve` – selector of link elements inside the `selectorView`. By default the selector watches all `<a>` tags excluding those which have the classname `.no-singlepage`. The default value is `'a:not(.no-singlepage)'`.
* `eventNameInitialize` – eventName to trigger the initialization of new modules in the replaced content area. By default the value is set to `'application:start'`.
* `eventNameDestroy` – eventName to trigger the destruction of old modules from the previous content area. By default the value is set to `'application:stop'`.
* `translateIn` – class reference for the in-transition between each navigation
* `translateOut` – class reference for the out-transition between each navigation

**Attention:**
*To keep your application performant, you should destroy your unused modules
between each navigation process. Pay also attention not to initialize
each module more than once when not using picnic's `Initialize` command.
Keep track of your command and value wiring when calling an initialize
command more than once.*

**Events**

* `singlepage:navigate` – is triggered when a user clicks on a link
* `singlepage:navigate:init` – is triggered when the navigation process initialize (before transition in)
* `singlepage:navigate:start` – is triggered when the navigation process starts to update the content (after transition in, only fired when the request was successful)
* `singlepage:navigate:end` – is triggered when the navigation process has completed the content update (before transiton out, only fired when the request was successful)
* `singlepage:navigate:done` – is triggered when the navigation process is completed
* `singlepage:navigate:fail` – is triggered when the navigation process fails (e.g. 404 or 500 status codes)

`import Singlepage from 'picnic/singlepage/commands/Initialize'`



**Example:**

```js
		import Singlepage from 'picnic/singlepage/commands/Initialize';
		import ExampleInitialize from 'app/example/commands/Initialize';
		import ExampleDestroy from 'app/example/commands/Destroy';

		...

		context.wireCommands({
			'application:start': [
				Singlepage,
				ExampleInitialize
			],
			'application:stop': [
				ExampleDestroy
			]
		});
```

**Example:**

```js
		context.wireValue('singlepage:settings', {
			selectorView: 'body',
			selectorUpdate: '#main',
			selectorObserve: 'a:not(.no-singlepage)',

			eventNameInitialize: 'application:start',
			eventNameDestroy: 'application:stop',

			translateIn: Translate,
			translateOut: Translate
		});
```

**Example:**

```js
		import $ from 'jquery';
		import Translate from 'picnic/singlepage/commands/Translate';

		class Fade extends Translate {
			execute() {
				var fade = (this.eventData.translate === 'in') ? 'fadeOut' : 'fadeIn';
				$('#main')[fade](
					500,
					this.done.bind(this)
				);
			}
		}

		...

		context.wireValue('singlepage:settings', {
			translateIn: Fade,
			translateOut: Fade
		});
```



























### Tabfocus

This module adds a class to a focused element when it is selected with tab -
and tab only. In your CSS first reset the default focus behavior (see
example) to get rid of the default focus outline. To define a focus for tab
selection add a class of your choice and give it the desired focus outline.

You can easily adjust the default focusable elements selector and focus
classname by using the 'tabfocus:settings' key on the geppetto context
(see example). These are the properties which can be changed:

* `selectorFocusable` – the selector of all DOM elements to handle focus events, default value is `a, button, input, textarea, select, [tabindex]`
* `classFocus` – the classname to apply when an element is selected, default value is `is-focused`

`import Tabfocus from 'picnic/tabfocus/commands/Initialize'`



**Example:**

```js
		// CSS, using modernizr to progressively enhance...
		.js a:focus,
		.js button:focus,
		.js [tabindex]:focus {
			outline: 0;
		}

		// give it an other focus
		.is-focused {
			outline: auto 3px #333333;
		}
```

**Example:**

```js
		this.wireValue('tabfocus:settings', {
			selectorFocusable: 'a',
			classFocus: 'foobar'
		});
```















### Tabs

A module to create an accessible tab navigation based on minimal and fallback
compatible markup. An instance of the tabs module allows the user to navigate
via arrow keys, home and end key as well using enter or space key to toggle
each panels visibility. By default there are only three classes to set into
your stylesheets to enable the visual changes:

* `.is-collapsed` hides closed tab panels
* `.is-selected` marks the selected tab button
* `.is-disabled` use this class to visually disable a tab

Tabs and accordions have quite the same functionality. They only differ in
the layout of their markup. Take a look at the second example how to enable
an accordion behaviour.

`import View from 'picnic/tabs/views/Tabs'`



**Example:**

```js
		<!-- Usage as tabs module -->
		<ul class="tabs">
			<li><a href="#tab1" title="Open tab 1">Tab 1</a></li>
			<li><a href="#tab2" title="Open tab 2">Tab 2</a></li>
			<li class="is-disabled"><a href="#tab3" title="Open tab 3">Tab 3 (disabled)</a></li>
		</ul>

		<div id="#tab1"><h2>Tab 1 content</h2></div>
		<div id="#tab2"><h2>Tab 2 content</h2></div>
		<div id="#tab3"><h2>Tab 3 content</h2></div>

		// Javascript:
		import Tabs from 'picnic/tabs/views/Tabs';

		var tabs = new Tabs({
			el: $('.tabs').get(0),
			context: app.context
		}).render();
```

**Example:**

```js
		<!-- Usage as accordion module -->
		<div class="accordion">
			<h2><a href="#section1" title="Open section 1">Section 1</a></h2>
			<div id="section1"><p>Section 1</p></div>
			<h2><a href="#section2" title="Open section 2">Section 2</a></h2>
			<div id="section2"><p>Section 2</p></div>
			<h2><a href="#section3" title="Open section 3">Section 3</a></h2>
			<div id="section3"><p>Section 3</p></div>
		</div>

		// Javascript:
		import Tabs from 'picnic/tabs/views/Tabs';

		var accordion = new Tabs({
			el: $('.accordion').get(0),
			context: app.context,
			toggleable: true
		}).render();
```



#### Constructor `View`
Creates an instance of the view.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view|
|`options.context`|`object`|The reference to the backbone.geppetto context|
|`options.el`|`object`|The element reference for a backbone.view|
|`options.root`|`element, $element`|A reference for the view to look up for tab panels. By default this is null which means the lookup will be the whole DOM.|
|`options.selectorButton`|`string`|is the selector for tab buttons|
|`options.selected`|`number`|is the initial selected tab index. Default is [0]. When initialize with no selection, use an empty array: [].|
|`options.toggleable`|`boolean`|defines if a tabs state is toggleable between selected and not. This means if enabled, a active tab can be collapsed by second user click on the same tab. This is mostly required for accordion behaviours. Default is false|
|`options.multiselectable`|`boolean`|allows the activation of more than one tabs. Default is false|
|`options.classSelected`|`string`|the classname to use for selected tab buttons. Default value is &#x27;is-selected&#x27;|
|`options.classCollapsed`|`string`|the classname to use for collapsed tab panels. Default value is &#x27;is-collapsed&#x27;|
|`options.classDisabled`|`string`|the classname to use for disabled tab elements. Default value is &#x27;is-disabled&#x27;|





#### `.selected`

Gets and sets the selected index of tabs. The getter returns a list of selected tab indexes. When setting a new index it's possible to pass a single number as index or an array as list of indexes. When passing null the selection will be empty.






#### `.isToggleable`

Returns if the toggleable option is set or not.






#### `.isMultiselectable`

Retuns if the tabs module is multiselectable.









#### `.render()`

This renders the content of this view and enables all features.




This function returns:

|type|description|
|---|---|
|`object`|The instance of this view|





#### `.destroy()`

Removes all inner references and eventlisteners.








#### `.getTabAt(index)`

Returns the jQuery reference of a tab element at a given index.


|name|type|description|
|---|---|---|
|`index`|`number`|is the index of the returned tab element.|



This function returns:

|type|description|
|---|---|
|`$element`|is the elements jQuery reference.|





#### `.getButtonAt(index)`

Returns the jQuery reference of a button element inside a tab at a given index.


|name|type|description|
|---|---|---|
|`index`|`number`|is the index of the returned button element.|



This function returns:

|type|description|
|---|---|
|`$element`|is the elements jQuery reference.|





#### `.enableTabAt(index)`

Enables a tab at the given index.


|name|type|description|
|---|---|---|
|`index`|`number`|is the index of the tab to be enabled|







#### `.disableTabAt(index)`

Disables a tab at the given index. The tab and it's tab panels content will not be accessible until its enabled again.


|name|type|description|
|---|---|---|
|`index`|`number`|is the index of the tab to be disabled.|







#### `.isDisabledTabAt(index)`

Returns if a tab is disabled at a given index.


|name|type|description|
|---|---|---|
|`index`|`number`|is the index of the tab to check|



This function returns:

|type|description|
|---|---|
|`boolean`|describes if the tab is disabled or not|





#### `.isSelected(index)`

Returns if the tab at the given index is selected (not collapsed).


|name|type|description|
|---|---|---|
|`index`|`number`|is the index of the tab to check|



This function returns:

|type|description|
|---|---|
|`boolean`|describes if the tab is selected (not collapsed)|





#### `.toggleAll(isSelected)`

This toggles selected states of all existing tabs.


|name|type|description|
|---|---|---|
|`isSelected`|`boolean`|describes if the tab should be selected|



















### Tracking-Bounce

A service to which fires an event based on a continuous tick. This tick event
can be handled by commands or other tracking services.

`import Service from 'picnic/tracking-bounce/services/Bounce'`




#### Constructor `Service`
Creates an instance of the bounce service.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the service.|
|`options.context`|`context`|The reference to the backbone.geppetto context.|
|`options.tick`|`number`|The time to pause between each tick in milliseconds. Default value is 10000ms / 10s|
|`options.end`|`number`|The duration until the service should stop to fire events. The end time will be calulated based on this value on start of the first tick. (see options.autostart or method .start() for more details). The value is defined in milliseconds. Default value is 180000ms / 3min. When setting this value to Infinity the service will run for ever until .reset() is called.|
|`options.autostart`|`boolean`|Defines if the tick should start right after instantiation of the service. The default value is &#x27;true&#x27;. When set to &#x27;false&#x27; the service must me manually started by calling .start() on the instance.|
|`options.eventName`|`string`|The event to fire on each tick. The default value is: &#x27;bounceservice:tick&#x27;|
|`options.eventData`|`object`|The event data to be send when a tick appears.|








#### `.start()`

This function starts the tick interval of the service. The final end will be calculated when calling this function based on the given end-option.








#### `.reset()`

This function stops the tick interval of the service.














### Tracking-Outbound

A service to handle clicks on outgoing links. When the user performs such an
action, this service triggers an event which can be handled by commands or
other tracking services.

`import Service from 'picnic/tracking-outbound/services/Outbound'`




#### Constructor `Service`
Creates an instance of the outbound service.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the service.|
|`options.context`|`context`|The reference to the backbone.geppetto context.|
|`options.root`|`string`|The selector where to attach a clickhandler and manage all elements from (options.selector). The default value is: &#x27;body&#x27;|
|`options.selector`|`string`|The selector where to check outgoing links. The default selector/value is: &#x27;a&#x27; (all links).|
|`options.regexDomain`|`RegExp`|A regular expression for links which matches the current domain and/or subdomains and wont be treated as outgoing link. The default value is based on the current location.hostname including any subdomain.|
|`options.eventName`|`string`|The event to fire when an outgoing link is clicked. The default value is: &#x27;outbound:open&#x27;|
|`options.eventData`|`object`|The event data to be send when an outgoing link is clicked. The default value is prefilled with our generic use for googleanalytics eventtracking with the values in &#x27;options.eventData.category&#x27; and &#x27;options.eventData.action&#x27;.|
|`options.eventData.category`|`string`|The default value is &#x27;outbound&#x27;|
|`options.eventData.action`|`string`|The default value is &#x27;link&#x27;|












### Tracking-Registry

A service to handle events from context and remap the event data for tracking
purposes.

`import Service from 'picnic/tracking-registry/services/Registry'`




#### Constructor `Service`
Creates an instance of the registry service.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the service.|
|`options.context`|`context`|The reference to the backbone.geppetto context.|








#### `.register(fire, eventName, mapping)`

This function adds a listener at the context for a given event name. If this event appears, it fires an other event and remaps the received event data for the new event. This can be used to wire a lot of events in an application into a single event. The event data will be updated to be used in a single backbone.geppetto command.


|name|type|description|
|---|---|---|
|`fire`|`string`|The event name which will be fired after the registered event appeared.|
|`eventName`|`string`|The event name to listen and remap|
|`mapping`|`object`|Defines the values which should be given to the track event call. Define here all values for the track event call (category, action, label, value). The registry can handle predefined values and dynamic value from functions or properties. To use functions or properties use a leading &quot;.&quot;. The event data object must support those functions or properties.|






**Example:**

```js
		register('event:to:fire', 'event:to:wait:for' {
			category: 'some-category',
			action: 'some-action',
			label: '.getLabel',
			value: '.getValue'
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		// function into a specific property to add custom logic.
		register('event:to:fire', 'event:to:wait:for' {
			category: 'some-category',
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? 'omg' : 'wtf';
			}
		});
```



#### `.registerEvent(eventName, mapping)`

Register a track event call to a specific context event. This is a shorthand for .register()-call with settings for eventtacking in google analytics.


|name|type|description|
|---|---|---|
|`eventName`|`string`|Is the specific event name.|
|`mapping`|`object`|Defines the values which should be given to the track event call. Define here all values for the track event call (category, action, label, value). The registry can handle predefined values and dynamic value from functions or properties. To use functions or properties use a leading &quot;.&quot;. The event data object must support those functions or properties.|






**Example:**

```js
		registerEvent('some:event', {
			category: 'some-category',
			action: 'some-action',
			label: '.getLabel',
			value: '.getValue'
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		//function into a specific property to add custom logic.
		registerEvent('some:event', {
			category: 'some-category',
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? 'omg' : 'wtf';
			}
		});
```



#### `.registerPageview(eventName, mapping)`

Register a track pageview call to a specific context event. This is a shorthand for .register()-call with settings for pageviewtacking in google analytics.


|name|type|description|
|---|---|---|
|`eventName`|`string`|Is the specific event name.|
|`mapping`|`object`|Defines the values which should be given to the track pageview call. Define here all values for the track pageview call (path). The registry can handle predefined values and dynamic value from functions or properties. To use functions or properties use a leading &quot;.&quot;. The event data object must support those functions or properties.|






**Example:**

```js
		registerPageview('some:event', {
			path: '/some-path/'
		});
```

**Example:**

```js
		registerPageview('some:event', {
			path: '.path'
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		//function into a specific property to add custom logic.
		registerPageview('some:event', {
			path: function(eventData, thisMapping) {
				return evenData.foo.bar() ? '/omg/' : '/wtf/';
			}
		});
```



#### `.registerSocial(eventName, mapping)`

Register a track social call to a specific context event. This is a shorthand for .register()-call with settings for socialtracking in google analytics.


|name|type|description|
|---|---|---|
|`eventName`|`string`|Is the specific event name.|
|`mapping`|`object`|Defines the values which should be given to the track event call. Define here all values for the track event call (network, action, targetUrl, pagePathUrl). The registry can handle predefined values and dynamic value from functions or properties. To use functions or properties use a leading &quot;.&quot;. The event data object must support those functions or properties.|






**Example:**

```js
		registerSocial('some:event', {
			network: 'facebook',
			action: 'like',
			targetUrl: '.shareUrl'
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		//function into a specific property to add custom logic.
		registerSocial('some:event', {
			network: 'twitter',
			action: function(eventData, thisMapping) {
				return evenData.isTweet ? 'tweet' : 'retweet';
			},
			targetUrl: '/path-to-share/'
		});
```









### Vimeoplayer

A module including a view to generate a Vimeo player.

The view requires for each element a video id passed by the data attribute
`data-vimeoid` and an element that triggers the play event on click, as you can see
in the example below.

Once the user clicks the link, the vimeo player api is loaded and the
player will be initialized. Multiple vimeo player on a single page share the
same api. The api will be loaded only once when the first player starts to
play.

`import View from 'picnic/vimeoplayer/views/Vimeoplayer'`



**Example:**

```js
		<div class="vimeoplayer" data-vimeoid="{{id}}">
			<a href="https://vimeo.com/{{id}}" target="_blank" title="Play video">
				Play video
			</a>
		</div>
```



#### Constructor `View`
Creates an instance of the view.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view|
|`options.context`|`object`|The reference to the backbone.geppetto context|
|`options.el`|`object`|The element reference for a backbone.view|
|`options.debug`|`boolean`|Enable debug mode. The default value is false|
|`options.loader`|`object`|ApiLoader reference|
|`options.eventNamespace`|`string`|Set the namespace for events to dispatch onto the Context&#x27;s Event Bus|
|`options.trigger`|`string`|Name of the element that triggers the inizialize or play event. The default value is &quot;a&quot;|
|`options.classLoading`|`string`|Set a CSS class on loading the video. The default value is &quot;loading&quot;|
|`options.classPlaying`|`string`|Set a CSS class on playing the video. The default value is &quot;playing&quot;|
|`options.playerHideSpeed`|`number`|Set the speed of the hide animation, in miliseconds. The default value is 300|
|`options.playerProgressSteps`|`number`|Update progress every x steps, in percent. The default value is 5|
|`options.playerProgressInterval`|`number`|Set the progress interval, in milliseconds. The default value is 1000|
|`options.playerOptions`|`object`|Vimeo Player options, see https://github.com/vimeo/player.js#embed-options. By default the autoplay option is set to true|








#### `.render()`

This renders the content of this view




This function returns:

|type|description|
|---|---|
|`object`|The instance of this view|





#### `.destroy()`

Remove event listeners and destroy inner vimeo player instance.








#### `.play()`

Play the video if is initialized otherwise render it








#### `.pause()`

Pause the video








#### `.stop()`

Stop the video








#### `.stopMedia()`

Overwrite default stopMedia method from [Mediaplayer](#mediaplayer).








#### `.getVideoId()`

Get the id of the video




This function returns:

|type|description|
|---|---|
|`number`|The id of the video|





#### `.getProgress()`

Get the progress of the video




This function returns:

|type|description|
|---|---|
|`number`|The progress of the video|











### Youtubeplayer

A module including a view to generate a Youtubeplayer.

The view requires for each element a video id passed by the data attribute
`data-youtubeid` and an link that triggers the play event on click, as you
can see in the example below.

Once the user clicks the link, the youtube iframe api is loaded and the
player will be initialized. Multiple youtubeplayer on a single page share the
same api. The api will be loaded only once when the first player starts to
play.

`import View from 'picnic/youtubeplayer/views/Youtubeplayer'`



**Example:**

```js
		<div class="youtubeplayer" data-youtubeid="{{id}}">
			<a href="https://www.youtube.com/watch?v={{id}}" target="_blank" title="Play video">
				Play video
			</a>
		</div>
```



#### Constructor `View`
Creates an instance of the view.


|name|type|description|
|---|---|---|
|`options`|`object`|The settings for the view|
|`options.context`|`object`|The reference to the backbone.geppetto context|
|`options.el`|`object`|The element reference for a backbone.view|
|`options.loader`|`object`|ApiLoader reference|
|`options.selectorPlay`|`string`|Selector of the element that triggers the inizialize or play event. The default value is &quot;a&quot;|
|`options.classLoading`|`string`|Set a CSS class on loading the video. The default value is &quot;loading&quot;|
|`options.classPlaying`|`string`|Set a CSS class on playing the video. The default value is &quot;playing&quot;|
|`options.fadeOutDuration`|`number`|Set the speed of the hide animation, in miliseconds. The default value is 300|
|`options.progressSteps`|`number`|Update progress every x steps, in percent. The default value is 5|
|`options.progressInterval`|`number`|Set the progress interval, in milliseconds. The default value is 1000|
|`options.settings`|`object`|Youtubeplayer settings|
|`options.settings.width`|`object`|Youtubeplayer width is by default set to &quot;100%&quot;.|
|`options.settings.height`|`object`|Youtubeplayer height is by default set to &quot;100%&quot;.|
|`options.settings.playerVars`|`object`|Youtubeplayer parameters including overwritten default values according the documentation https://developers.google.com/youtube/player_parameters#Parameters.|
|`options.settings.playerVars.autoplay`|`number`|Sets whether or not the initial video will autoplay when the player loads. Default is 1|
|`options.settings.playerVars.color`|`string`|This parameter specifies the color that will be used in the player&#x27;s video progress bar to highlight the amount of the video that the viewer has already seen. Valid parameter values are red and white, and, by default, the player will use the color red in the video progress bar. Default value is &quot;white&quot;|
|`options.settings.playerVars.showinfo`|`number`|The parameter&#x27;s default value is 1. If you set the parameter value to 0, then the player will not display information like the video title and uploader before the video starts playing. Default value is 0|
|`options.settings.playerVars.rel`|`number`|This parameter indicates whether the player should show related videos when playback of the initial video ends. Default value is 0|
|`options.settings.playerVars.theme`|`string`|This parameter indicates whether the embedded player will display player controls (like a play button or volume control) within a dark or light control bar. Valid parameter values are dark and light, and, by default, the player will display player controls using the dark theme. Default value is &quot;light&quot;|
|`options.settings.playerVars.wmode`|`string`|Sets the flash wmode. Default value is &quot;opaque&quot;|








#### `.render()`

This renders the content of this view




This function returns:

|type|description|
|---|---|
|`object`|The instance of this view|





#### `.destroy()`

Remove event listeners and destroy inner youtubeplayer instance.








#### `.getVideoId()`

Get the id of the video




This function returns:

|type|description|
|---|---|
|`number`|The id of the video|





#### `.getProgress()`

Get the progress of the video




This function returns:

|type|description|
|---|---|
|`number`|The progress of the video|





#### `.play()`

Play the video if is initialized otherwise render the player.








#### `.pause()`

Pause the video








#### `.stop()`

Stop the video








#### `.stopMedia()`

Overwrite default stopMedia method from [Mediaplayer](#mediaplayer).












## Mixins



### Base-Mixin

The base mixin class. This class allows to merge properties of a specific
mixin class into an instance of an other class.

`import Mixin from 'picnic/mixins/Base'`



**Example:**

```js
		import BaseMixin from 'picnic/mixins/Base';

		class ExampleMixin extends BaseMixin {
			sayHello() {
				alert('Hello!');
			}
		}

		class Example {
			constructor() {
				// Apply mixin:
				new ExampleMixin(this);
			}

			sayWhat() {
				alert('What?');
			}
		}

		var example = new Example();
		example.sayWhat();
		example.sayHello();
```



#### Constructor `Mixin`
This applies all mixin&#x27;s properties to the given target instance.


|name|type|description|
|---|---|---|
|`target`|`object`|is the target instance of the class where to merge the mixin&#x27;s properties into.|












### UniqueID-Mixin

This mixin adds a new method property to each applied instance which retuns
an unique ID. Each time this method is called on a certain instance, it
returns the same unique ID as before.

`import Mixin from 'picnic/mixins/Unique'`



**Example:**

```js
		import UniqueMixin from 'picnic/mixins/Unique';

		class Example {
			constructor() {
				// Apply mixin:
				new UniqueMixin(this);
			}
		}

		var example = new Example();
		example.getUniqueId();
```



#### Constructor `Mixin`
This applies all mixin&#x27;s properties to the given target instance and creates an unique ID.


|name|type|description|
|---|---|---|
|`target`|`object`|is the target instance of the class where to merge the mixin&#x27;s properties into.|








#### `.getUniqueId(force)`

This returns the unique ID. When passed `true` as param a new unique ID is calculated for this instance. The previous one gets lost.


|name|type|description|
|---|---|---|
|`force`|`boolean`|forces the re-calculculation of the unique ID. Default is &#x60;false&#x60;.|



This function returns:

|type|description|
|---|---|
|`string`|is the unique ID.|









### Visibility-Mixin

This mixin adds a scroll behaviour to the applied view (requires to be a
backbone view). The mixin's features will be initialized on the targets
instance `render()` call and destroyed when `destroy()` is called. Once
rendered this mixin fires events when the instance's DOM element is getting
visible or invisible on the users viewport.
These events are `'visibility:visible'` and `'visibility:invisible'`. It's
also possible to define an offset in pixels when to fire the events.

`import Mixin from 'picnic/mixins/Visibility'`



**Example:**

```js
		import BaseView from 'picnic/core/views/Base';
		import VisibilityMixin from 'picnic/mixins/Visibility';

		class Example extends BaseView {

			constructor() {
				// Apply mixin:
				new VisibilityMixin(this, 100);
			}

			render() {
				super.render();

				this
					.on('visibility:visible', () => {
						console.log('Hello', this.isVisible());
					})
					.on('visibility:invisible', () => {
						console.log('Goodbye', this.isVisible());
					});

				return this;
			}

		}

		var example = new Example({
			el: document.getElementById('example'),
			context: app.context
		}).render();
```



#### Constructor `Mixin`
This applies all mixin&#x27;s properties to the given target instance.


|name|type|description|
|---|---|---|
|`target`|`object`|is the target instance of the class where to merge the mixin&#x27;s properties into.|
|`offset`|`number`|is the offset for the visibility calculation. A positive offset defines the instance&#x27;s DOM element to be higher as it is, a negative to be shorter. Default is &#x60;0&#x60;.|








#### `.isVisible()`

Returns if the DOM element is visible on the users viewport.




This function returns:

|type|description|
|---|---|
|`boolean`|if the element visible.|









## Shortcuts

TBD

## Requirements

TBD

## Contribution

TBD

## License

[LICENSE](https://github.com/moccu/picnic/blob/master/LICENSE.md)
