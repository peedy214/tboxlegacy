async function handle(bot, msg, handlers) {
	const ctx = {
		bot,
		msg,
		target: msg.channel,
		reportErrors: false
	};

	try {
		for(let handler of handlers) {
			ctx.continue = await handler(ctx);
			if(!ctx.continue) break;
		}
	} catch(e) {
		return bot.err(msg, e, ctx.reportErrors);
	}

	if(ctx.response) {
		if(typeof ctx.response == "string") ctx.response = {content: ctx.response};
		else ctx.response.content = "";
		if(ctx.target != msg.channel) ctx.response.content += "\n\nThis message sent to you in DMs because I do not have permission to send messages in the original channel!";
		return bot.send(ctx.target, ctx.response);
	}
}

async function standardChecks(ctx) {
	let {msg, bot} = ctx;
	if(msg.author.bot || msg.type != 0) return false;
	if(await bot.db.getGlobalBlacklisted(msg.author.id)) return false;
    
	ctx.blacklist = +(await bot.db.blacklist.get(msg.channel));
	ctx.cfg = msg.channel.guild ? (await bot.db.config.get(msg.channel.guild.id) || { ...bot.defaultCfg }) : { ...bot.defaultCfg };
	ctx.members = await bot.db.members.getAll(msg.author.id);
	return true;
}

async function messageEditChecks(ctx) {
	let {msg} = ctx;
	// occasionally errors on bot message embeds for some reason?
	if(!msg.author) return false;
	// ignore messages sent more than 10 minutes ago
	if(Date.now() - msg.timestamp > 1000*60*10) return false;
	return true;
}

async function basicPermissionChecks(ctx) {
	let {msg, bot} = ctx;
	if(!msg.member) return true;
	
	ctx.botPerms = msg.channel.permissionsOf(bot.user.id);
	if(!ctx.botPerms.has("readMessages")) return false; //sometimes happens, thanks discord
	if(ctx.botPerms.has("sendMessages")) return true;

	//no permission to send messages, try DM channel
	try { 
		ctx.target = await bot.getDMChannel(msg.author.id); 
	} catch(e) { 
		if(e.code != 50007) bot.err(msg, e, false); 
		return false; 
	}

	return true;
}

async function handleDialog(ctx) {
	let {msg, bot} = ctx;
	let dialogKey = msg.channel.id + msg.author.id;

	if(!bot.dialogs[dialogKey]) return true;
        
	bot.dialogs[dialogKey](msg);
	delete bot.dialogs[dialogKey];
	return false;
}

async function handlePing(ctx) {
	let {msg, bot, cfg} = ctx;
	if(!msg.content.startsWith(`<@${bot.user.id}>`) && !msg.content.startsWith(`<@!${bot.user.id}>`)) return true;
        
	ctx.response = `Hello! ${msg.channel.guild ? "This server's" : "My"} prefix is \`{{tul!}}\`. Try \`{{tul!}}help\` for help${(msg.channel.guild && cfg.prefix != process.env.DEFAULT_PREFIX) ? ` or \`{{tul!}}cfg prefix ${process.env.DEFAULT_PREFIX}\` to reset the prefix` : ""}.`;
	return false;
}

async function handleCommand(ctx) {
	let {msg, bot, cfg, blacklist} = ctx;
	if(!msg.content.toLowerCase().startsWith(cfg.prefix)) return true;
	if((blacklist & 1) && !msg.member.permission.has("manageGuild")) return true;

	let content = msg.content.substr(cfg.prefix.length).trim();
	let args = content.split(" ");
	let cmdName = args.shift();	
	let cmd = bot.cmds[cmdName];
	if(!cmd) return true;

	ctx.reportErrors = true;
	ctx.args = args;
	ctx.commandName = cmdName;

	ctx.response = await cmd.handle(ctx);
	return false;
}

async function handleProxy(ctx) {
	let {members, blacklist, bot, target} = ctx;
	if(!members[0]) return true;
	if(target.guild && (blacklist & 2)) return true;
    
	ctx.response = await bot.proxy.executeProxy(ctx);
	return (ctx.response === undefined);
}

const messageCreateHandlers = [standardChecks, basicPermissionChecks, handleDialog, handlePing, handleCommand, handleProxy];
const messageUpdateHandlers = [messageEditChecks, standardChecks, handleProxy];

module.exports = {handle, messageCreateHandlers, messageUpdateHandlers};