import OpenCommand from 'picnic/overlay/commands/Open';
import CloseCommand from 'picnic/overlay/commands/Close';


class Command {
	execute() {
		this.context.wireCommand('overlay:open', OpenCommand);
		this.context.wireCommand('overlay:close', CloseCommand);
	}
}

export default Command;
