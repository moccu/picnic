/*jshint esnext: true */
(function() {

	var
		win = window,
		NAMESPACE = 'ApplicationRunner',
		TYPE_OF_FUNCTION = 'function'
	;

	function run(pathes, namespace) {
		next(pathes, function(modules) {
			if (modules) {
				var base = modules.pop().default;
				base.addPlugins(modules);
				base.start();

				if (typeof namespace === 'string') {
					win[namespace] = base;
				}
			}
		});
	}

	function next(pathes, callback, modules) {
		var path = pathes.pop();
		if (path) {
			win.System.import(path)
				.then(function(module) {
					modules = modules || [];
					modules.push(module);
					next(pathes, callback, modules);
				})
				.catch(function(error) {
					if (win.Raven && typeof win.Raven.captureException === TYPE_OF_FUNCTION) {
						win.Raven.captureException(error, {
							extra: {
								message: 'Loading error in ApplicationRunner',
								stack: error.stack
							}
						});
					}

					if (win.console && typeof win.console.error === TYPE_OF_FUNCTION) {
						win.console.error(error);
					}
				});
		} else {
			callback(modules);

			// Remove to keep global namespace clean...
			removeRunner();
		}
	}

	function addRunner() {
		win[NAMESPACE] = {
			run: run
		};
	}

	function removeRunner() {
		win[NAMESPACE] = undefined;
		delete(win[NAMESPACE]);
	}

	// Add to global namespace...
	addRunner();
})();
