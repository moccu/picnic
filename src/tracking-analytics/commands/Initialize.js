import $ from 'jquery';


var
	DEFAULTS = {
		// Hostname is required for google analytics tracking 'create' call
		hostname: 'auto',
		// Optional prefix for track pageview calls in tracked URLs
		pageviewPrefix: '',
		// Source of the google analytics script:
		source: '//www.google-analytics.com/analytics.js'
	},
	NAMESPACE_SETTINGS = 'tracking-analytics:settings'
;


class Command {

	execute() {
		var
			settings = $.extend({}, DEFAULTS),
			cookie
		;

		// Load possible settings from registered plugins:
		if (this.context.hasWiring(NAMESPACE_SETTINGS)) {
			settings = $.extend(settings, this.context.getObject(NAMESPACE_SETTINGS));
		}

		// Test for given Google Analytics ID
		if (typeof settings.id !== 'string') {
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
		})(window,document,'script', settings.source,'ga');

		window.ga('create', settings.id, settings.hostname);
		window.ga('set', 'anonymizeIp', true);
		window.ga('require', 'displayfeatures');

		window.ga('send', 'pageview', settings.pageviewPrefix + document.location.pathname);

		// Add opt out feature:
		cookie = 'ga-disable-' + settings.id;

		function optout() {
			document.cookie = cookie + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
			window[cookie] = true;
		}

		if (document.cookie.indexOf(cookie + '=true') > -1) { optout(); }
		window.gaOptout = optout;
	}
}

export default Command;
