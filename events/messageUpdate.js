const {handle, messageUpdateHandlers} = require("../modules/messageHandlers");

module.exports = async (msg, _, bot) => {
	return handle(bot, msg, messageUpdateHandlers);
};
