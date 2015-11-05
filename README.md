# picnic

Collection of tiny backbone.geppetto modules and tools to make our live easier.

## Contents
1. [Modules](#modules)
	1. [Tracking-Registry](#tracking-registry)
2. [Shortcuts](#shortcuts)
3. [Requirements](#requirements)
4. [Contribution](#contribution)
5. [License](#license)


## Modules















































### Tracking-Registry

`import Service from 'picnic/tracking-registry/services/Registry'`

A service to handle events from context and remap the event data for tracking
purposes.


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
		register(&#x27;event:to:fire&#x27;, &#x27;event:to:wait:for&#x27; {
			category: &#x27;some-category&#x27;,
			action: &#x27;some-action&#x27;,
			label: &#x27;.getLabel&#x27;,
			value: &#x27;.getValue&#x27;
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		// function into a specific property to add custom logic.
		register(&#x27;event:to:fire&#x27;, &#x27;event:to:wait:for&#x27; {
			category: &#x27;some-category&#x27;,
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? &#x27;omg&#x27; : &#x27;wtf&#x27;;
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
		registerEvent(&#x27;some:event&#x27;, {
			category: &#x27;some-category&#x27;,
			action: &#x27;some-action&#x27;,
			label: &#x27;.getLabel&#x27;,
			value: &#x27;.getValue&#x27;
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		//function into a specific property to add custom logic.
		registerEvent(&#x27;some:event&#x27;, {
			category: &#x27;some-category&#x27;,
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? &#x27;omg&#x27; : &#x27;wtf&#x27;;
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
		registerPageview(&#x27;some:event&#x27;, {
			category: &#x27;some-category&#x27;,
			action: &#x27;some-action&#x27;,
			label: &#x27;.getLabel&#x27;,
			value: &#x27;.getValue&#x27;
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		//function into a specific property to add custom logic.
		registerPageview(&#x27;some:event&#x27;, {
			category: &#x27;some-category&#x27;,
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? &#x27;omg&#x27; : &#x27;wtf&#x27;;
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
		registerSocial(&#x27;some:event&#x27;, {
			category: &#x27;some-category&#x27;,
			action: &#x27;some-action&#x27;,
			label: &#x27;.getLabel&#x27;,
			value: &#x27;.getValue&#x27;
		});
```

**Example:**

```js
		// You can also use function references here by passing the
		//function into a specific property to add custom logic.
		registerSocial(&#x27;some:event&#x27;, {
			category: &#x27;some-category&#x27;,
			action: function(eventData, thisMapping) {
				return evenData.foo.bar() ? &#x27;omg&#x27; : &#x27;wtf&#x27;;
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
