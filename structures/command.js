module.exports = class Command {

	constructor(bot) {
		this.bot = bot;
		this.botPerms = [];
		this.userPerms = [];
		this.visible = true;
		this.cooldown = 1000;
	}

	checkPermissions(channel, member) {
		if(!member) return [];
		if(member.id === this.bot.owner) return [];
		let perms = channel.permissionsOf(member);
		return this.userPerms.map(p => perms.has(p));
	}
};