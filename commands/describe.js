const Command = require("../structures/command");

module.exports = class DescribeCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "View or change {{a tupper}}'s description";
		this.usage = [
			["<name> [desc]", "if desc is specified, change the {{tupper}}'s describe, if not, simply echo the current one"],
			["[name] clear/remove/none/delete", "Unset a description for the given {{tupper}}."]
		];
		this.groupArgs = true;
	}

	async execute(bot, msg, args) {
		if(!args[0]) return bot.cmds.help.execute(bot, msg, ["describe"]);
		
		//check arguments
		let member = await bot.db.members.get(msg.author.id,args[0]);
		if(!member) return `You don't have {{a tupper}} named '${args[0]}' registered.`;
		if(!args[1]) return member.description ? "Current description: " + member.description + "\nTo remove it, try {{tul!}}describe '" + member.name + "' clear" : "No description currently set for " + member.name;
		if(["clear","remove","none","delete"].includes(args[1])) {
			await bot.db.members.update(msg.author.id,member.name,"description",null);
			return "Description cleared.";
		}
		
		//update member
		let temp = msg.content.slice(msg.content.indexOf(args[0]) + args[0].length);
		let desc = temp.slice(temp.indexOf(args[1]));
		await bot.db.members.update(msg.author.id,args[0],"description",desc.slice(0,1023));
		if(desc.length > 1023) return "Description updated, but was truncated due to Discord embed limits.";
		return "Description updated successfully.";
	}
};
