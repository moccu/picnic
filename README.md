# picnic

Collection of tiny backbone.geppetto modules and tools to make our live easier.

[![Travis Status](https://travis-ci.org/moccu/picnic.png?branch=master)](https://travis-ci.org/moccu/picnic)

## Contents
1. [Modules](#modules)
	1. [Tracking-Registry](#tracking-registry)
2. [Shortcuts](#shortcuts)
3. [Requirements](#requirements)
4. [Contribution](#contribution)
5. [License](#license)


## Modules















































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
