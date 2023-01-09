require('dotenv').config({ path: require('find-config')('.env') });
const listPrenk = require('../../storage/listPrenk');
const { antiSpam, randomElementFromList, logTime } = require('../serverMaintenance');
const { DATABASE_ADMIN_DELETE_USERNAME } = require('../databases/sheetdb');
const { getUserCountById, updateItemCount } = require('../databases/dynamodb');
const { checkUser } = require('./checkUser');
const { postRandomDailyVideo } = require('../AWS/S3');
const { 
	botInfo,
	hAdminInfo,
	commands,
	randomEmojiSuccess,
	randomEmojiError,
	waitForBot
} = require('../../storage/exportTxt');
const { 
	sendMessage,
	getUserByUsername,
	relationshipId,
	postStatusText,
	userBlocksBot
} = require('../twitterapi/twitterLib');
const {
	sendHelp,
	sendInfo,
	whitelistAdd,
	blacklistAdd
} = require('./switchCommands');


/*
*	async prenk(senderId, senderUsername, targetUsername)
*	async onNewMessage(event)
*/

const spamChecker = new antiSpam();

const prenk = async (senderId, targetId, targetUsername) => {

	const result = await relationshipId(senderId, targetId);

	if(result[0] === -1){
		sendMessage(senderId, `Mićko @${targetUsername} ne postoji ${randomElementFromList(randomEmojiError)}`);
		return 0;
	}
	if(result[0] === 0){
		sendMessage(senderId, `Ne pratish mićka ${randomElementFromList(randomEmojiError)}`);
		return 0;
	}
	if(result[1] === 0){
		sendMessage(senderId, `Mićko te ne prati ${randomElementFromList(randomEmojiError)}`);
		return 0;
	}

	const randInt = Math.floor(Math.random()*(listPrenk.length));
	const text = `@${targetUsername}\n\n${listPrenk[randInt]}\n\nPrenk ${randomElementFromList(randomEmojiSuccess)}🤙🤙`;

	try{
		postStatusText(text)
			.then(() => sendMessage(senderId, `Uspeshno si prenkowo @${targetUsername} swe u 16 ${randomElementFromList(randomEmojiSuccess)}`));
	}catch(e){
		console.log("Error in ./dependencies/webhookExport/patoshi");
		console.log(e);
	}

	// If success return 1
	return 1;
}

const onNewMessage = async (event, whitelist, blacklist) => {
	try{
		// We check that the event is a direct message
		if (!event.direct_message_events){
			return;
		}

		const myId = event.for_user_id;
		const senderId = event.direct_message_events[0].message_create.sender_id;

		// Avoiding infinite loop
		if(senderId === myId){
			return;
		}

		const senderUsername = event.users[senderId].screen_name;
		const text = event.direct_message_events[0].message_create.message_data.text;

		// Anti spam checker
		if(spamChecker.checkSpam(senderId)){

			// If it's spam sendMessage
			if(!spamChecker.getWarning(senderId)){
				sendMessage(senderId, `Sachekaj bota bote (spam protection) ${randomElementFromList(randomEmojiError)}${randomElementFromList(randomEmojiError)}`);
			}

			// Disable sending message in this block of spam
			spamChecker.setWarning(senderId);
			return;
		}

		// Check user criteria
		const userCheck = await checkUser(senderId, whitelist, blacklist);
		if(userCheck === false)
			return;

		const numOfCommandUses = await getUserCountById('daily-usage', senderId);

		// Split message and trim username (if exists and starts with @)
		const splitedMsg = text.split(' ');
		let targetUsername = '';
		if(splitedMsg.length > 1){
			const _targetUsername = splitedMsg[1];
			targetUsername = _targetUsername.startsWith('@') ? 
					_targetUsername.substring(_targetUsername.lastIndexOf('@') + 1) : _targetUsername;
		}

		// If first word is unknow command send list of commands to use
		if(!commands.includes(splitedMsg[0])){
			sendMessage(senderId, botInfo + '\n' + randomElementFromList(randomEmojiSuccess) + 
									' ' + randomElementFromList(randomEmojiError));
			return;
		}

		// If command is preview skip target checks
		if(splitedMsg[0] === 'preview'){
			if(splitedMsg.length === 1) return;
			// Trim first character if it starts with '!'
			sendMessage(senderId, randomElementFromList(waitForBot));
			const command = splitedMsg[1].startsWith('!') ? splitedMsg[1].substring(1) : splitedMsg[1];
			sendMessage(senderId, randomElementFromList(randomEmojiSuccess)+randomElementFromList(randomEmojiError), command);
			return;
		}

		// Check if targetUsername exists
		const targetInfo = await getUserByUsername(targetUsername);
		const targetId = targetInfo.id_str;
		if(splitedMsg.length !== 1 && targetId === '-1'){
			sendMessage(senderId, `Mićko @${targetUsername} ne postoji ${randomElementFromList(randomEmojiError)}`);
			return;
		}

		// Check if target blocks bot
		if(!(await userBlocksBot(targetId))){
			sendMessage(senderId, `Mićko blokiro bota ${randomElementFromList(randomEmojiError)}`);
			return;
		}

		switch(splitedMsg[0]){
			case '!prenk':
				if(splitedMsg.length === 1) return;
				const res = await prenk(senderId, targetId, targetUsername);
				// On successful prenk increment
				if(res === 1){
					updateItemCount('daily-usage', senderId);
					logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) prenked @${targetUsername}`);
				}
				return;
			case '!help':
				sendHelp(senderId);
				return;
			case '!info':
				sendInfo(senderId, numOfCommandUses, process.env.MAX_DAILY_USAGE);
				return;

			// HEAD ADMIN COMMANDS
			case '!admin':
				if(senderId === process.env.HEAD_ADMIN_ID){
					sendMessage(senderId, hAdminInfo);
				}
				return;
			case '!wadd':
				if(splitedMsg.length === 1){
					return;
				}
				if(senderId === process.env.HEAD_ADMIN_ID){
					whitelistAdd(senderId, whitelist, targetUsername);
				}
				return;
			case '!wrem':
				if(splitedMsg.length === 1){
					return;
				}
				if(senderId === process.env.HEAD_ADMIN_ID){
					DATABASE_ADMIN_DELETE_USERNAME('Whitelist', targetUsername);
					logTime(`@${targetUsername} removed from whitelist.`);
				}
				return;
			case '!badd':
				if(splitedMsg.length === 1){
					return;
				}
				if(senderId === process.env.HEAD_ADMIN_ID){
					blacklistAdd(senderId, blacklist, targetUsername);
				}
				return;
			case '!brem':
				if(splitedMsg.length === 1){
					return;  
				}
				if(senderId === process.env.HEAD_ADMIN_ID){
					DATABASE_ADMIN_DELETE_USERNAME('Blacklist', targetUsername);
					logTime(`@${targetUsername} removed from blacklist.`);
				}
				return;
			case '!forceDaily':
				if(senderId === process.env.HEAD_ADMIN_ID){
					postRandomDailyVideo('kavali');
				}
				return;
			default:
				sendMessage(senderId, botInfo);
		}

	}catch(e){
		console.log("Error in ./dependencies/onNewMessage");
		console.log(e);
	}
}

module.exports = {
	onNewMessage
}