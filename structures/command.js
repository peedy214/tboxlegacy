const cache = require("../modules/redis");

module.exports = class Command {

	constructor(bot) {
		this.bot = bot;
		this.botPerms = [];
		this.userPerms = [];
		this.visible = true;
		this.cooldown = 1;
	}

	async handle(ctx) {
		let permissionError = await this.checkPermissions(ctx);
		if(permissionError) return permissionError;
		let key = ctx.msg.author.id + ctx.commandName;
		let cd = await cache.cooldowns.get(key);
		if(cd) return `You're using that too quickly! Try again in ${Math.ceil((cd - Date.now())/1000)} seconds`;
		if(this.cooldown && !process.env.DEV) cache.cooldowns.set(key, this.cooldown * 1000);
	
		if(this.groupArgs) ctx.args = this.bot.getMatches(ctx.msg.content, /“(.+?)”|‘(.+?)’|"(.+?)"|'(.+?)'|(\S+)/gi).slice(1);
	
		let output = await this.execute(ctx);
		if(!output) return;
		if(ctx.cooldown) { //cooldown overrides
			cache.cooldowns.set(key, ctx.cooldown * 1000);
		}
		return output;
	}

	async checkPermissions(ctx) {
		let {msg} = ctx;
		if(!msg.member) return;
		let botPerms = msg.channel.permissionsOf(msg.channel.guild.members.get(this.bot.user.id));
		let missingBotPerms = this.botPerms.filter(perm => !botPerms.has(perm));
		if(missingBotPerms[0]) return `I am missing permissions required to execute this command: ${this.makePermsReadable(missingBotPerms)}`;

		if(msg.member.id === this.bot.owner) return;
		let userPerms = msg.channel.permissionsOf(msg.member);
		let missingUserPerms = this.userPerms.filter(perm => !userPerms.has(perm));
		if(missingUserPerms[0]) return `You need these permissions to execute this command: ${this.makePermsReadable(missingUserPerms)}`;
	}

	//should go in another file?
	makePermsReadable(perms) {
		return perms.map(p => p.split(/(?=[A-Z])/).map(s => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()).join(" "));
	}
};