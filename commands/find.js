const Command = require("../structures/command");

module.exports = class FindCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Find and display info about {{tupper}}s by name";
		this.usage = [
			["<name>", "Attempts to find {{a tupper}} with exactly the given name, and if none are found, tries to find {{tupper}}s with names containing the given name."]
		];
		this.groupArgs = true;
	}

	async execute(bot, msg, args) {
		if(!args[0]) return bot.cmds.help.execute(bot, msg, ["find"]);

		//do search
		let search = args.join(" ").toLowerCase();
		let targets; 
		if(msg.channel.type == 1)
			targets = [msg.author];
		else {
			return "Searching in servers is temporarily disabled due to recent Discord changes. We have a request in processing to obtain rights needed to re-enable it. Please check the support server for updates or try again in a day or two.";
			/*await bot.sendChannelTyping(msg.channel.id);
			targets = await bot.findAllUsers(msg.channel.guild.id);*/
		}
		let results = (await bot.db.query("SELECT * FROM Members WHERE user_id IN (select(unnest($1::text[]))) AND (CASE WHEN tag IS NULL THEN LOWER(name) LIKE '%' || $2 || '%' ELSE (LOWER(name) || LOWER(tag)) LIKE '%' || $2 || '%' END) LIMIT 25", [targets.map(u => u.id), search])).rows;
		if(!results[0]) return `Couldn't find {{a tupper}} named '${search}'.`;

		//return single match
		if(results.length == 1) { 
			let t = results[0];
			let host = targets.find(u => u.id == t.user_id);
			let group = null;
			if(t.group_id) group = await bot.db.groups.getById(t.group_id);
			let val = `User: ${host ? host.username + "#" + host.discriminator : "Unknown user " + t.user_id}\n`;
			let embed = { embed: {
				author: {
					name: t.name,
					icon_url: t.url
				},
				description: val + bot.paginator.generateMemberField(bot, t, group, val.length).value,
			}};
			return embed;
		}

		//build paginated list of results
		let embeds = [];
		let current = { embed: {
			title: "Results",
			fields: []
		}};
		for(let i=0; i<results.length; i++) {
			let t = results[i];
			if(current.embed.fields.length >= 5) {
				embeds.push(current);
				current = { embed: {
					title: "Results",
					fields: []
				}};
			}
			let group = null;
			if(t.group_id) group = await bot.db.groups.getById(t.group_id);
			let host = targets.find(u => u.id == t.user_id);
			let val = `User: ${host ? host.username + "#" + host.discriminator : "Unknown user " + t.user_id}\n`;
			current.embed.fields.push({name: t.name, value: val + bot.paginator.generateMemberField(bot, t, group, val.length).value});
		}

		embeds.push(current);
		if(embeds.length > 1) {
			for(let i = 0; i < embeds.length; i++)
				embeds[i].embed.title += ` (page ${i+1}/${embeds.length} of ${results.length} results)`;
			return bot.paginator.paginate(bot, msg, embeds);
		}
		return embeds[0];
	}
};
