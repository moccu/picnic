import Backbone from 'backbone';
import Geppetto from 'backbone.geppetto';

class BaseView extends Backbone.View {
	constructor(options) {
		super(options);

		if (!options.context || !(options.context instanceof Geppetto.Context)) {
			throw new Error('Supply the correct context instance.');
		}

		this.context = options.context;
		this.options = options;
	}

	render() {
		return this;
	}

	destroy() {
		this.context = undefined;
		this.options = undefined;
		delete(this.context);
		delete(this.options);
	}
}

export default BaseView;
