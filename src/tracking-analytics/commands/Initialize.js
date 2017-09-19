import $ from 'jquery';
import _ from 'underscore';


var
	DEFAULTS = {
		// Hostname is required for google analytics tracking 'create' call
		hostname: 'auto',
		// Optional prefix for track pageview calls in tracked URLs
		pageviewPrefix: '',
		// Source of the google analytics script:
		source: '//www.google-analytics.com/analytics.js',
		// A list of additional initial calls before the first track pageview
		// will be send:
		initialCalls: [],
		// the object or string for the initial pageview
		pageviewParam: undefined,
		// enable automatic pageview after initializing
		autoPageview: true
	},
	NAMESPACE_SETTINGS = 'tracking-analytics:settings'
;


class Command {

	execute() {
		var cookie;

		// Test for given Google Analytics ID
		if (typeof this.settings.id !== 'string') {
			throw new Error('Missing Google Analytics ID');
		}

		// Inject Google Analytics Code, jshint and jscs compatible:
		(function(i, s, o, g, r, a, m) {
			i.GoogleAnalyticsObject = r;
			i[r] = i[r] || function() {
				(i[r].q = i[r].q || []).push(arguments);
			};
			i[r].l = 1 * new Date();
			a = s.createElement(o);
			m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m);
		})(window,document,'script', this.settings.source,'ga');

		window.ga('create', this.settings.id, this.settings.hostname);
		window.ga('set', 'anonymizeIp', true);
		window.ga('require', 'displayfeatures');

		_.each(this.settings.initialCalls, args => {
			if (_.isArray(args)) {
				window.ga.apply(window.ga, args);
			}
		});

		if (this.settings.autoPageview) {
			window.ga('send', 'pageview', this.pageview);
		}

		// Add opt out feature:
		cookie = 'ga-disable-' + this.settings.id;

		function optout() {
			document.cookie = cookie + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
			window[cookie] = true;
		}

		if (document.cookie.indexOf(cookie + '=true') > -1) { optout(); }
		window.gaOptout = optout;
	}

	get settings() {
		var settings = $.extend({}, DEFAULTS);

		// Load possible settings from registered plugins:
		if (this.context.hasWiring(NAMESPACE_SETTINGS)) {
			settings = $.extend(settings, this.context.getObject(NAMESPACE_SETTINGS));
		}

		return settings;
	}

	get pageview() {
		return this.settings.pageviewParam || (this.settings.pageviewPrefix + document.location.pathname)
	}

}

export default Command;
