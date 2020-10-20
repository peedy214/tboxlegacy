const fs = require("fs").promises;
let policy = null;
fs.readFile("./privacy.txt").then(file => policy = file.toString()).catch((err) => { if(err.code != "ENOENT") console.warn(err); });

const Command = require("../structures/command");

module.exports = class PrivacyCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "View my privacy policy.";
		this.usage = [
			["", "show the privacy policy"]
		];
	}

	execute(ctx) {
		return policy;
	}
};
