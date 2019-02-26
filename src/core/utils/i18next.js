const i18next = window.i18next || {};

i18next.t = function(label, props) {
	if (window.i18next && typeof window.i18next.t === 'function') {
		return window.i18next.t(label, props);
	} else {
		if (label && typeof props === 'object') {
			Object.keys(props).forEach(function(key) {
				const re = new RegExp('{{ ?' + key + ' ?}}', 'g');
				label = label.replace(re, props[key]);
			});
		}

		return label;
	}
};

export {i18next};
