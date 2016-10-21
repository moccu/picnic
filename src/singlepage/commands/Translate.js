class Command {

	execute() {
		this.done();
	}

	done() {
		this.context.dispatch(this.eventName + ':done');
	}

}

export default Command;
