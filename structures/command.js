const cache = require("../modules/redis");

module.exports = class Command {

	constructor(bot) {
		this.bot = bot;
		this.botPerms = [];
		this.userPerms = [];
		this.visible = true;
		this.cooldown = 1000;
	}

	async handle(ctx) {	
		let key = ctx.msg.author.id + ctx.commandName;
		let cd = await cache.cooldowns.get(key);
		if(cd) return `You're using that too quickly! Try again in ${Math.ceil((cd - Date.now())/1000)} seconds`;
		if(this.cooldown && !process.env.DEV) cache.cooldowns.set(key, this.cooldown);
	
		if(this.groupArgs) ctx.args = this.bot.getMatches(ctx.msg.content, /“(.+?)”|‘(.+?)’|"(.+?)"|'(.+?)'|(\S+)/gi).slice(1);
	
		let output = await this.execute(ctx);
		if(!output) return;
		if(ctx.cooldown) { //cooldown overrides
			cache.cooldowns.set(key, ctx.cooldown);
		}
		return output;
	}

	async checkPermissions(channel, member) {
		if(!msg.member) return [];
		let botPerms = msg.channel.permissionsOf(msg.channel.guild.members.get(bot.user.id));
		//if(missingPerms[0]) return `I am missing permissions required to execute this command: \`${missingPerms.join(", ")}\``;

		if(!member) return [];
		if(member.id === this.bot.owner) return [];
		let perms = channel.permissionsOf(member);
		return (member.id === this.bot.user.id ? ["sendMessages", ...this.botPerms] : this.userPerms).filter(p => perms.has(p));
	}
};