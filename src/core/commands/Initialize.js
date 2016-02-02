import $ from 'jquery';
import _ from 'underscore';


class Command {

	get settings() {
		return null;
	}

	execute() {
		this.preExecute();

		var
			views = [],
			self = this,
			data = self.eventData,
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

		if (context.hasWiring(settings.namespace)) {
			views = context.getObject(settings.namespace);
		}

		$(settings.selector, data.root).each(function() {
			if (_.where(views, {el: this}).length === 0) {
				views.push(new settings.viewclass($.extend({
					el: this,
					context: context
				}, settings.viewoptions)).render());
			}
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
