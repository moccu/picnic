export default {
	namespace: 'singlepage',
	namespaceSettings: 'singlepage:settings',
	namespaceViews: 'singlepage:views',
	namespaceService: 'singlepage:service',

	defaults: {
		selectorView: 'body',
		selectorUpdate: '#main',
		selectorObserve: 'a:not(.no-singlepage)',

		eventNameNavigate: 'singlepage:navigate',
		eventNameInitialize: 'application:start',
		eventNameDestroy: 'application:stop',

		scriptIds: [],
		styleIds: []
	}
};
