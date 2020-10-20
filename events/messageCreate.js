const {handle, messageCreateHandlers} = require("../modules/messageHandlers");

module.exports = async (msg, bot) => {
	return handle(bot, msg, messageCreateHandlers);
};
