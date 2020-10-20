const Command = require("../structures/command");

module.exports = class ListNGCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Like list, but without showing group info.";
		this.usage = [
			["[user]", "Sends a list of the user's registered {{tupper}}s, their brackets, post count, and birthday (if set). If user is not specified it defaults to the message author.\nThe bot will provide reaction emoji controls for navigating long lists: Arrows navigate through pages, # jumps to a specific page, ABCD jumps to a specific {{tupper}}, and the stop button deletes the message."]
		];
		this.botPerms = ["embedLinks"];
		this.cooldown = 30*1000;
	}

	async execute(ctx) {
		return ctx.bot.cmds.list.execute(ctx, true);
	}
};
