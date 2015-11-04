import $ from 'jquery';

class Command {

	get settings() {
		return null;
	}

	execute() {
		this.preExecute();

		var
			views = [],
			self = this,
			context = self.context,
			settings = self.settings
		;

		if (!settings.viewclass) {
			throw new Error('Define a view class');
		}

		if (!settings.selector) {
			throw new Error('Define a selector');
		}

		if (!settings.namespace) {
			throw new Error('Define a namespace');
		}

		$(settings.selector).each(function() {
			views.push(new settings.viewclass($.extend({
				el: this,
				context: context
			}, settings.viewoptions)).render());
		});

		context.wireValue(settings.namespace, views);

		this.postExecute();
	}

	preExecute() {
		// Overwrite this...
	}

	postExecute() {
		// Overwrite this...
	}

}

export default Command;
