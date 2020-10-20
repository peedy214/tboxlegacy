const Command = require("../structures/command");

module.exports = class RemoveCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Unregister {{a tupper}}";
		this.usage = [
			["<name>", "Unregister the named {{tupper}} from your list"],
			["*", "Unregister ALL of your {{tupper}}s (requires confirmation)"]
		];
		this.groupArgs = true;
	}

	async execute(ctx) {
		let {bot, msg, args, members} = ctx;
		if(!args[0]) return bot.cmds.help.execute(ctx, "remove");

		//check arguments
		if(args[0] == "*") {
			if(members.length == 0) return "You don't have anything to remove.";
			let confirm = await bot.confirm(msg, "Warning: This will remove ALL of your {{tupper}}s. Reply 'yes' to continue or anything else to cancel.");
			if(confirm !== true) return confirm;
			await bot.db.members.clear(msg.author.id);
			return "All {{tupper}}s removed.";
		}
		else if(args.length == 1) {
			let name = args.join(" ");
			let member = await bot.db.members.get(msg.author.id, name);
			if(!member) return `You don't have {{a tupper}} named '${name}' registered.`;
			await bot.db.members.delete(msg.author.id, name);
			return "{{Tupper}} unregistered.";
		} else {
			let removedMessage = "{{Tupper}}s removed:";
			let notRemovedMessage = "{{Tupper}}s not found:";
			let baseLength = 2000 - (removedMessage.length + notRemovedMessage.length);
			let rOriginalLength = { removedMessage: removedMessage.length, notRemovedMessage: notRemovedMessage.length, };

			for(let arg of args) {
				let tup = await bot.db.members.get(msg.author.id, arg);
				if(tup) {
					await bot.db.members.delete(msg.author.id, arg);
					if((removedMessage.length + notRemovedMessage.length + arg.length) < baseLength) removedMessage += ` '${arg}'`; else removedMessage += " (...)";
				} else {
					if((removedMessage.length + notRemovedMessage.length + arg.length) < baseLength) notRemovedMessage += ` '${arg}'`; else notRemovedMessage += " (...)";
				}
			}
			if(removedMessage.length == rOriginalLength.removedMessage) return "No {{tupper}}s found.";
			if(notRemovedMessage.length == rOriginalLength.notRemovedMessage) return removedMessage;
			return `${removedMessage}\n${notRemovedMessage}`;
		}
	}
};