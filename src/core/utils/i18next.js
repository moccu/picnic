const i18next = window.i18next || {};

i18next.init = window.i18next ? window.i18next.init : function(options) {
	// If i18next is already initialized, use the existing instance
	if (window.i18next && i18next.init !== window.i18next.init) {
		return window.i18next.init(options);
	}

	// Fallback implementation for i18next.init
	if (options && options.resources) {
		i18next.language = options.lng || 'en';
		i18next.store = { data: options.resources };
	}

	return Promise.resolve();
}

i18next.t = (window.i18next) ? window.i18next.t : function(label, props) {
	// If i18next is already initialized, use the existing instance
	if (window.i18next && i18next.t !== window.i18next.t) {
		return window.i18next.t(label, props);
	}

	// Fallback implementation for i18next.t
	if (i18next.store?.data && i18next.language && label) {
		label = i18next.store.data[i18next.language]?.[label] || label;
	}

	// Replace placeholders in the label with values from props
	if (label && typeof props === 'object') {
		Object.keys(props).forEach(function(key) {
			const re = new RegExp('{{ ?' + key + ' ?}}', 'g');
			label = label.replace(re, props[key]);
		});
	}

	return label;
};

export {i18next};
