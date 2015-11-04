import OpenCommand from 'picnic/clickblocker/commands/Open';
import CloseCommand from 'picnic/clickblocker/commands/Close';

class Command {
	execute() {
		this.context.wireCommand('clickblocker:open', OpenCommand);
		this.context.wireCommand('clickblocker:close', CloseCommand);
	}
}

export default Command;
