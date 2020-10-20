const Command = require("../structures/command");
const util = require("util");

module.exports = class DevCommand extends Command {

	constructor(bot) {
		super(bot);
		this.visible = false;
	}

	async execute(ctx) {
		let {bot, msg, args} = ctx;
		if(msg.author.id != bot.owner) return;
		switch(args.shift()) {
		case "eval":
			let out;
			try {
				out = await eval(args.join(" "));
			} catch(e) { out = e.toString(); }
			return util.inspect(out).split(process.env.DISCORD_TOKEN).join("[[ TOKEN ]]").slice(0, 2000);
		case "reload":
			process.send({name: "broadcast", msg: {name: "reload", type: args[0], targets: args.slice(1), channel: msg.channel.id}});
			if(args[0] == "ipc") process.send({name:"reloadIPC"});
			return "Reload command sent!";
		case "blacklist":
			await bot.banAbusiveUser(args.shift(), msg.channel.id);
			break;
		}
	}
};
