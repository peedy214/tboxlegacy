const Command = require("../structures/command");

module.exports = class FeedbackCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Get a link to the official support server!";
		this.usage = [
			["", "get a link to the support server"]
		];
	}

	execute(bot, msg, args) {
		return process.env.SUPPORT_INVITE;
	}
};