const Command = require("../structures/command");

module.exports = class ShowUserCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Show the user that registered the {{tupper}} that last spoke";
		this.usage = [
			["", "Finds the user that registered the {{tupper}} that last sent a message in this channel"]
		];
	}
	
	execute(ctx) {
		let {bot, msg} = ctx;
		if(!bot.recent[msg.channel.id])	return "No {{tupper}}s have spoken in this channel since I last started up, sorry.";
		let recent = bot.recent[msg.channel.id][0];
		bot.send(msg.channel, { content: `That proxy was sent by <@!${recent.user_id}> (tag at time of sending: ${recent.tag} - id: ${recent.user_id}).`, allowedMentions: { users: false } });
	}
};