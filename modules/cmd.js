const cache = require("../modules/redis");

module.exports = async ({msg, bot, members, cfg}) => {

	let targetChannel = msg.channel;
	let content = msg.content.substr(cfg.prefix.length).trim();
	let args = content.split(" ");
	let cmdName = args.shift();
	
	let cmd = bot.cmds[cmdName];
	if (!cmd) return;

	if(msg.member) {
		let missingPerms = cmd.checkPermissions(targetChannel, msg.channel.guild.members.get(bot.user.id));
		if(missingPerms[0]) return "I am missing permissions required to execute this command";
	}

	let key = msg.author.id + cmdName;
	let cd = await cache.cooldowns.get(key);
	if (cd) return bot.send(targetChannel,`You're using that too quickly! Try again in ${Math.ceil((cd - Date.now())/1000)} seconds`);
	if(cmd.cooldown && !process.env.DEV) cache.cooldowns.set(key, cmd.cooldown);

	if(cmd.groupArgs) args = bot.getMatches(content,/“(.+?)”|‘(.+?)’|"(.+?)"|'(.+?)'|(\S+)/gi).slice(1);

	try {
		let output = await cmd.execute(bot, msg, args, members);
		if(output && (typeof output == "string" || output.embed)) {
			if(targetChannel != msg.channel) {
				let add = "This message sent to you in DM because I am lacking permissions to send messages in the original channel.";
				if(output.embed) output.content = add;
				else output += "\n" + add;
			}
			bot.send(targetChannel,output,null,true,msg.author);
		}
	} catch(e) { 
		bot.err(msg,e);
	}

};