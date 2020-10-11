const Command = require("../structures/command");

module.exports = class TagCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Remove or change {{a tupper}}'s tag (displayed next to name when proxying)";
		this.usage = [
			["<name> [tag]", "if tag is given, change the {{tupper}}'s tag, if not, show the current one."],
			["[name] clear/remove/none/delete", "Unset a tag for the given {{tupper}}."],
			["*", "clear tag for all {{tupper}}s"]
		];
		this.desc = "{{A tupper}}'s tag is shown next to their name when speaking.";
		this.groupArgs = true;
	}

	async execute(bot, msg, args) {
		if(!args[0]) return bot.cmds.help.execute(bot, msg, ["tag"]);
		
		//check arguments & clear tag if empty
		if(args[0] == "*") {
			if(args[1]) return "Cannot mass assign tags due to name limits.";
			await bot.db.members.clearTags(msg.author.id);
			return "Tag cleared for all {{tupper}}s.";
		}
		let member = await bot.db.members.get(msg.author.id, args[0]);
		if(!member) return `You don't have {{a tupper}} named '${args[0]}' registered.`;
		if(!args[1]) return member.tag ? "Current tag: " + member.tag + "\nTo remove it, try {{tul!}}tag " + member.name + " clear" : "No tag currently set for " + args[0];
		if(["clear", "remove", "none", "delete"].includes(args[1])) {
			await bot.db.members.update(msg.author.id, member.name, "tag", null);
			return "Tag cleared.";
		}
		if (args.slice(1).join(" ").length > 25) return "That tag is too long. Please use one with less than 25 characters.";
		
		//update member
		await bot.db.members.update(msg.author.id, args[0], "tag", bot.noVariation(args.slice(1).join(" ")));
		return "Tag updated successfully.";
	}
};