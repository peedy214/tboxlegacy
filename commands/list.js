const Command = require("../structures/command");

module.exports = class ListCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "Get a detailed list of yours or another user's registered {{tupper}}s";
		this.usage = [
			["[user]", "Sends a list of the user's registered {{tupper}}s, their brackets, post count, and birthday (if set). If user is not specified it defaults to the message author.\nThe bot will provide reaction emoji controls for navigating long lists: Arrows navigate through pages, # jumps to a specific page, ABCD jumps to a specific {{tupper}}, and the stop button deletes the message."]
		];
		this.botPerms = ["embedLinks"];
		this.cooldown = 30000;
	}

	async execute(ctx, ng = false) {
		let {bot, msg, args} = ctx;
		//get target list
		let target;
		if(args[0]) {
			target = await bot.resolveUser(msg, args.join(" "));
		} else target = msg.author;
		if(!target) return "User not found.";

		//generate paginated list with groups
		let groups = await bot.db.groups.getAll(target.id);
		if(groups[0] && !ng) {
			let members = await bot.db.members.getAll(target.id);
			if(!members[0]) return (target.id == msg.author.id) ? "You have not registered any {{tupper}}s." : "That user has not registered any {{tupper}}s.";
			if(members.find(t => !t.group_id)) groups.push({name: "Ungrouped", id: null});
			let embeds = [];
			for(let i=0; i<groups.length; i++) {
				let extra = {
					title: `${target.username}#${target.discriminator}'s registered {{tupper}}s`,
					author: {
						name: target.username, 
						icon_url: target.avatarURL
					},
					description: `Group: ${groups[i].name}${groups[i].tag ? "\nTag: " + groups[i].tag : ""}${groups[i].description ? "\n" + groups[i].description : ""}`
				};
				let add = await bot.paginator.generatePages(bot, members.filter(t => t.group_id == groups[i].id), t => bot.paginator.generateMemberField(bot, t), extra);
				if(add[add.length-1].embed.fields.length < 5 && groups[i+1]) add[add.length-1].embed.fields.push({
					name: "\u200b",
					value: `Next page: group ${groups[i+1].name}`
				});
				embeds = embeds.concat(add);
			}
			
			for(let i=0; i<embeds.length; i++) {
				embeds[i].embed.title = `${target.username}#${target.discriminator}'s registered {{tupper}}s`;
				if(embeds.length > 1) embeds[i].embed.title += ` (page ${i+1}/${embeds.length}, ${members.length} total)`;
			}

			if(embeds[1]) return bot.paginator.paginate(bot, msg, embeds);
			return embeds[0];
		}
		let members = await bot.db.members.getAll(target.id);
		if(!members[0]) return (target.id == msg.author.id) ? "You have not registered any {{tupper}}s." : "That user has not registered any {{tupper}}s.";

		//generate paginated list
		let extra = {
			title: `${target.username}#${target.discriminator}'s registered {{tupper}}s`,
			author: {
				name: target.username,
				icon_url: target.avatarURL
			}
		};
		
		let embeds = await bot.paginator.generatePages(bot, members, async t => {
			let group = null;
			if(t.group_id) group = await bot.db.groups.getById(t.group_id);
			return bot.paginator.generateMemberField(bot, t, group);
		}, extra);
		if(embeds[1]) return bot.paginator.paginate(bot, msg, embeds);
		return embeds[0];
	}
};
