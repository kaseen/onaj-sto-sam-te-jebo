require('dotenv').config({ path: require('find-config')('.env') });

const { randomEmojiSuccess, randomEmojiError } = require('../../storage/exportTxt');
const { sendMessage, getFollowers, userFollowsBot } = require('../twitterapi/twitterLib');
const { randomElementFromList } = require('../serverMaintenance');
const { getUserCountById } = require('../databases/dynamodb');

const checkUser = async (senderId, whitelist, blacklist) => {

	// Check if user follows bot
	if(!(await userFollowsBot(senderId))){
		sendMessage(senderId, `Zaprati bota, stoko ${randomElementFromList(randomEmojiError)}`);
		return false;
	}

	// Check if sender have enought followers (Skip for whitelist users)
	const senderIdFollowersCount = await getFollowers(senderId);
	if(senderIdFollowersCount < process.env.MIN_FOLLOWERS_WEBHOOK){
		if(whitelist.includes(senderId)){
			// Skip check for whitelist users
		} else {
			sendMessage(senderId, `Nemash ni ${process.env.MIN_FOLLOWERS_WEBHOOK} folowera yadno ${randomElementFromList(randomEmojiError)}`);
			return false;
		}
	}

	// Check if sender used all commands
	const numOfCommandUses = await getUserCountById('daily-usage', senderId);
	if(blacklist.includes(senderId)){
		sendMessage(senderId, `Mićko banowan si ${randomElementFromList(randomEmojiSuccess)}${randomElementFromList(randomEmojiError)}${randomElementFromList(randomEmojiError)}`);
		return false;
	}else if(whitelist.includes(senderId)){
		// Skip check for whitelist users
	}else if(numOfCommandUses >= process.env.MAX_DAILY_USAGE){
		sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} usluge danas ${randomElementFromList(randomEmojiError)}`);
		return false;
	}

	return true;
}

module.exports = {
	checkUser
}