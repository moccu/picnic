# picnic

Collection of tiny backbone.geppetto modules and tools to make our live easier.

[![Travis Status](https://travis-ci.org/moccu/picnic.png?branch=master)](https://travis-ci.org/moccu/picnic)

## Contents
1. [Modules](#modules)
	1. [Clickblocker](#clickblocker)
	1. [Initialize-Command](#initialize-command)
	1. [Overlay](#overlay)
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

























### Initialize-Command

A generic command to simply initialize view-modules by defining some
settings. The created view(s) will be wired to a given namespace and can be
accessed later on through the application context.

The three mandatory settings to provide are:

* viewclass
* selector
* namespace

To see how to use these settings take a look at the &#x60;&#x60;&#x60;get settings&#x60;&#x60;&#x60;-getter.

**Attention:**
*It&#x27;s important that the &#x60;render()&#x60;-function of the configured view-class has
to return the reference to itself.*

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
