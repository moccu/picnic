export function i18n(key, data) {
	return window.i18next ? window.i18next.t(key, data) : key;
}
