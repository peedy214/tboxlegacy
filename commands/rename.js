const Command = require("../structures/command");

module.exports = class RenameCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Change {{a tupper}}'s name";
		this.usage = [
			["<name> <newname>", "Set a new name for the {{tupper}}"]
		];
		this.desc = "Use single or double quotes around multi-word names `\"like this\"` or `'like this'`.";
		this.groupArgs = true;
	}

	async execute(bot, msg, args) {
		if(!args[0]) return bot.cmds.help.execute(bot, msg, ["rename"]);

		//check arguments
		let member = await bot.db.members.get(msg.author.id, args[0]);
		if(!args[1]) return "Missing argument 'newname'.";
		let newname = bot.sanitizeName(args[1]);
		let newMember = await bot.db.members.get(msg.author.id, newname);
		if(newname.length < 1 || newname.length > 76) return "New name must be between 1 and 76 characters.";
		if(!member) return `You don't have {{a tupper}} named '${args[0]}' registered.`;
		if(newMember && newMember.id != member.id) return "You already have {{a tupper}} with that new name.";
		
		//update member
		await bot.db.members.update(msg.author.id, args[0], "name", newname);
		return "{{Tupper}} renamed successfully.";
	}
};
