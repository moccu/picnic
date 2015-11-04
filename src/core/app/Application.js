class Application {
	constructor(Context) {
		this._context = new Context();
		this._context.application = this;

		this._plugins = [];
	}

	addPlugin(Plugin) {
		if (!Plugin) {
			throw new Error('Supply a plugin to add');
		}

		if (Plugin.default) {
			Plugin = Plugin.default;
		}

		var plugin = new Plugin(this._context);
		this._plugins.push(plugin);

		return this;
	}

	addPlugins(pluginClasses) {
		var Plugin;
		while (Plugin = (pluginClasses || []).pop()) {
			this.addPlugin(Plugin);
		}

		return this;
	}

	start() {
		this._context.dispatch('application:start');
		return this;
	}
}

export default Application;
