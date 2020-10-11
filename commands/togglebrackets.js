const Command = require("../structures/command");

module.exports = class ToggleBracketsCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Toggles whether the brackets are included or stripped in proxied messages for the given {{tupper}}";
		this.usage = [
			["<name>", "toggles showing brackets on or off for the given {{tupper}}"]
		];
		this.groupArgs = true;
	}

	async execute(bot, msg, args) {
		if(!args[0]) return bot.cmds.help.execute(bot, msg, ["togglebrackets"]);
		
		//check arguments
		let member = await bot.db.members.get(msg.author.id,args[0]);
		if(!member) return `You don't have {{a tupper}} named '${args[0]}' registered.`;
		
		//update member
		await bot.db.members.update(msg.author.id,args[0],"show_brackets",!member.show_brackets);
		return `Now ${member.show_brackets ? "hiding" : "showing"} brackets in proxied messages for ${member.name}.`;
	}
};