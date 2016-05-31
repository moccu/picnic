# picnic

Collection of tiny backbone.geppetto modules and tools to make our live easier.

[![Travis Status](https://travis-ci.org/moccu/picnic.png?branch=master)](https://travis-ci.org/moccu/picnic)

## Contents
1. [Modules](#modules)
	1. [Clickblocker](#clickblocker)
	1. [Destroy-Command](#destroy-command)
	1. [Initialize-Command](#initialize-command)
	1. [Overlay](#overlay)
	1. [Tabfocus](#tabfocus)
	1. [Tracking-Bounce](#tracking-bounce)
	1. [Tracking-Outbound](#tracking-outbound)
	1. [Tracking-Registry](#tracking-registry)
2. [Shortcuts](#shortcuts)
3. [Requirements](#requirements)
4. [Contribution](#contribution)
5. [License](#license)


## Modules





### Clickblocker

A module including commands and view to generate a clickblocker by calling
events on geppetto context.

The initialize command wires two commands to the context to open and close
the clickblocker. The events to trigger those commands are
&#x27;clockblocker:open&#x27; and &#x27;clockblocker:close&#x27;.

This initialize command offers the possibility, when executing this command
more than once, the initialization process itself is performed only once. So
there are no duplicate wirings for the &#x27;clockblocker:open&#x27;- or
&#x27;clockblocker:close&#x27;-event.

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
settings take a look at the &#x60;get settings&#x60;-getter.

When a view (which should be destroyed) has a &#x60;destroy()&#x60;-function, this
function will be called before the view will be removed from the namespace.

When wiring a destroy-command on a specific event and dispatch that event,
you can pass a &quot;root&quot; element to the event as data to define a specific tree
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

To see how to use these settings take a look at the &#x60;get settings&#x60;-getter.

When wiring a initialize-command on a specific event and dispatch that event,
you can pass a &quot;root&quot; element to the event as data to define a specific tree
in the DOM where the views should be initialized. Take a look at the
examples to see how it works.

**Attention:**
*It&#x27;s important that the &#x60;render()&#x60;-function of the configured view-class has
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




















### Overlay

A module including commands and view to generate an overlay by calling events
on geppetto context.

The initialize command wires two commands to the context to open and close
the overlay(s). The events to trigger those commands are &#x27;overlay:open&#x27; and
&#x27;overlay:close&#x27;.

This initialize command offers the possibility, when executing this command
more than once, the initialization process itself is performed only once. So
there are no duplicate wirings for the &#x27;overlay:open&#x27;- or
&#x27;overlay:close&#x27;-event.

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
		});
```

**Example:**

```js
		// Close an existing overlay
		context.dispatch('overlay:close');
```



















### Tabfocus

This module adds a class to an focused element if it was selected with tab. If
it was selected with f.e. a clickevent, there will be no focus class on the element.
And no focus should be visible. It gets rid the default outline of an
tab-enabled element on click.

`import Tabfocus from 'picnic/tabfocus/commands/Initialize'`



**Example:**

```js
In your CSS you first have to reset the default focus behaviour:
		a,
		button,
		[tabindex] {
			.js &:focus {
				outline: 0;
			}
		}

When you reset it no one would see the focus anymore. So add the class of
your choise and give it a nice focus outline.
```

**Example:**

```js
		&.is-focused {
			border-bottom: 0;
			outline: auto 3px rgba(#333333, 0.8);
		}

You can change "selectorFocusable" and "classFocus" within the options.
Default focusable elements are: "a, button, [tabindex]"
Default focus Class is: "is-focused"
```























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
|`mapping`|`object`|Defines the values which should be given to the track event call. Define here all values for the track event call (category, action, label, value). The registry can handle predefined values and dynamic value from functions or properties. To use functions or properties use a leading &quot;.&quot;. The event data object must support those functions or properties.|






**Example:**

```js
		registerPageview('some:event', {
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
		registerPageview('some:event', {
			category: 'some-category',
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? 'omg' : 'wtf';
			}
		});
```



#### `.registerSocial(eventName, mapping)`

Register a track social call to a specific context event. This is a shorthand for .register()-call with settings for socialtracking in google analytics.


|name|type|description|
|---|---|---|
|`eventName`|`string`|Is the specific event name.|
|`mapping`|`object`|Defines the values which should be given to the track event call. Define here all values for the track event call (category, action, label, value). The registry can handle predefined values and dynamic value from functions or properties. To use functions or properties use a leading &quot;.&quot;. The event data object must support those functions or properties.|






**Example:**

```js
		registerSocial('some:event', {
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
		registerSocial('some:event', {
			category: 'some-category',
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? 'omg' : 'wtf';
			}
		});
```












## Shortcuts

TBD

## Requirements

TBD

## Contribution

TBD

## License

[LICENSE](https://github.com/moccu/picnic/blob/master/LICENSE.md)
