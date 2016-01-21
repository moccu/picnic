import $ from 'jquery';


var
	win = window,
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
			self = this,
			context = self.context,
			options = $.extend({}, DEFAULTS),
			cookie
		;

		// Load possible options from registered plugins:
		if (context.hasWiring(NAMESPACE_SETTINGS)) {
			options = $.extend(options, context.getObject(NAMESPACE_SETTINGS));
		}

		// Test for given Google Analytics ID
		if (typeof options.id !== 'string') {
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
		})(win,document,'script', options.source,'ga');

		win.ga('create', options.id, options.hostname);
		win.ga('set', 'anonymizeIp', true);
		win.ga('require', 'displayfeatures');
		win.ga('send', 'pageview', options.pageviewPrefix + document.location.pathname);

		// Add opt out feature:
		cookie = 'ga-disable-' + options.id;

		function optout() {
			document.cookie = cookie + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
			window[cookie] = true;
		}

		if (document.cookie.indexOf(cookie + '=true') > -1) { optout(); }
		window.gaOptout = optout;

	}
}

export default Command;
