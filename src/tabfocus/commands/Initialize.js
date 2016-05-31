import Initialize from 'picnic/core/commands/Initialize';
import View from 'picnic/tabfocus/views/Tabfocus';


class Command extends Initialize {

	get settings() {
		return {
			namespace: 'tabfocus:views',
			selector: 'body',
			viewclass: View
		};
	}

}

export default Command;
