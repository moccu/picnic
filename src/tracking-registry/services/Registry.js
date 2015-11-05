import _ from 'underscore';

/**
 * A service to handle events from context and remap the event data for tracking
 * purposes.
 *
 * @class Tracking-Registry
 */
class Service {

	/**
	 * Creates an instance of the registry service.
	 *
	 * @constructor
	 * @param {object} options The settings for the service.
	 * @param {context} options.context The reference to the
	 *		backbone.geppetto context.
	 */
	constructor(options) {
		if (!options.context) {
			throw new Error('Tracking registry needs a context');
		}

		this._context = options.context;
		this._events = {};

		_.bindAll(this, '_onEvent');
	}

	/**
	 * This function adds a listener at the context for a given event name. If
	 * this event appears, it fires an other event and remaps the received event
	 * data for the new event. This can be used to wire a lot of events in an
	 * application into a single event. The event data will be updated to be
	 * used in a single backbone.geppetto command.
	 *
	 * @param {string} fire The event name which will be fired after the
	 *		registered event appeared.
	 * @param {string} eventName The event name to listen and remap
	 * @param {object} mapping Defines the values which should be given to the
	 *		track event call. Define here all values for the track event
	 *		call (category, action, label, value). The registry can handle
	 *		predefined values and dynamic value from functions or
	 *		properties. To use functions or properties use a leading ".".
	 *		The event data object must support those functions or properties.
	 * @example
	 *		register('event:to:fire', 'event:to:wait:for' {
	 *			category: 'some-category',
	 *			action: 'some-action',
	 *			label: '.getLabel',
	 *			value: '.getValue'
	 *		});
	 * @example
	 *		// You can also use function references here by passing the
	 *		// function into a specific property to add custom logic.
	 *		register('event:to:fire', 'event:to:wait:for' {
	 *			category: 'some-category',
	 *			action: function(eventData, thisMapping) {
	 *				return evenData.foo.bar() ? 'omg' : 'wtf';
	 *			}
	 *		});
	 */
	register(fire, eventName, mapping) {
		if (!_.isObject(mapping)) {
			throw new Error('Missing mapping config for "' + eventName + '"');
		}

		if (!this._events[eventName]) {
			this._context.vent.on(eventName, this._onEvent);
		}

		this._events[eventName] = this._events[eventName] || [];
		this._events[eventName].push({
			fire: fire,
			mapping: mapping
		});
	}

	/**
	 * Register a track event call to a specific context event. This is a
	 * shorthand for .register()-call with settings for eventtacking in
	 * google analytics.
	 *
	 * @param {string} eventName Is the specific event name.
	 * @param {object} mapping Defines the values which should be given to the
	 *		track event call. Define here all values for the track event
	 *		call (category, action, label, value). The registry can handle
	 *		predefined values and dynamic value from functions or
	 *		properties. To use functions or properties use a leading ".".
	 *		The event data object must support those functions or properties.
	 * @example
	 *		registerEvent('some:event', {
	 *			category: 'some-category',
	 *			action: 'some-action',
	 *			label: '.getLabel',
	 *			value: '.getValue'
	 *		});
	 * @example
	 *		// You can also use function references here by passing the
	 *		//function into a specific property to add custom logic.
	 *		registerEvent('some:event', {
	 *			category: 'some-category',
	 *			action: function(eventData, thisMapping) {
	 *				return evenData.foo.bar() ? 'omg' : 'wtf';
	 *			}
	 *		});
	 */
	registerEvent(eventName, mapping) {
		this.register('tracking:trackevent', eventName, mapping);
	}

	/**
	 * Register a track pageview call to a specific context event. This is a
	 * shorthand for .register()-call with settings for pageviewtacking in
	 * google analytics.
	 *
	 * @param {string} eventName Is the specific event name.
	 * @param {object} mapping Defines the values which should be given to the
	 *		track event call. Define here all values for the track event
	 *		call (category, action, label, value). The registry can handle
	 *		predefined values and dynamic value from functions or
	 *		properties. To use functions or properties use a leading ".".
	 *		The event data object must support those functions or properties.
	 * @example
	 *		registerPageview('some:event', {
	 *			category: 'some-category',
	 *			action: 'some-action',
	 *			label: '.getLabel',
	 *			value: '.getValue'
	 *		});
	 * @example
	 *		// You can also use function references here by passing the
	 *		//function into a specific property to add custom logic.
	 *		registerPageview('some:event', {
	 *			category: 'some-category',
	 *			action: function(eventData, thisMapping) {
	 *				return evenData.foo.bar() ? 'omg' : 'wtf';
	 *			}
	 *		});
	 */
	registerPageview(eventName, mapping) {
		this.register('tracking:trackpageview', eventName, mapping);
	}

	/**
	 * Register a track social call to a specific context event. This is a
	 * shorthand for .register()-call with settings for socialtracking in
	 * google analytics.
	 *
	 * @param {string} eventName Is the specific event name.
	 * @param {object} mapping Defines the values which should be given to the
	 *		track event call. Define here all values for the track event
	 *		call (category, action, label, value). The registry can handle
	 *		predefined values and dynamic value from functions or
	 *		properties. To use functions or properties use a leading ".".
	 *		The event data object must support those functions or properties.
	 * @example
	 *		registerSocial('some:event', {
	 *			category: 'some-category',
	 *			action: 'some-action',
	 *			label: '.getLabel',
	 *			value: '.getValue'
	 *		});
	 * @example
	 *		// You can also use function references here by passing the
	 *		//function into a specific property to add custom logic.
	 *		registerSocial('some:event', {
	 *			category: 'some-category',
	 *			action: function(eventData, thisMapping) {
	 *				return evenData.foo.bar() ? 'omg' : 'wtf';
	 *			}
	 *		});
	 */
	registerSocial(eventName, mapping) {
		this.register('tracking:tracksocial', eventName, mapping);
	}

	_build(target, mapping) {
		var data = {};
		// Build tracking data depending on mapping:
		_.each(mapping, function(value, key) {
			if (_.isString(value)) {
				if (value.indexOf('.') === 0) {
					value = value.substr(1);
					if (_.isFunction(target[value])) {
						data[key] = target[value]();
					} else if (target[value]) {
						data[key] = target[value];
					}
				} else {
					data[key] = value;
				}
			} else if (_.isFunction(value)) {
				data[key] = value.call(this, target, mapping);
			}
		}, this);

		return data;
	}

	_onEvent(event) {
		_.each(this._events[event.eventName], function(settings) {
			this._context.dispatch(
				settings.fire,
				this._build(event, settings.mapping)
			);
		}, this);
	}
}

/**
 * @module picnic/tracking-registry/services/Registry
 */
export default Service;
