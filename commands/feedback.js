const Command = require("../structures/command");

module.exports = class FeedbackCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Get a link to the official support server!";
		this.usage = [
			["", "get a link to the support server"]
		];
	}

	execute(ctx) {
		let {bot, msg, args} = ctx;
		return process.env.SUPPORT_INVITE;
	}
};