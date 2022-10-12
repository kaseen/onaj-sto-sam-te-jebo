require('dotenv').config({ path: require('find-config')('.env') });
const listPrenk = require('../../storage/listPrenk');
const { antiSpam, randomElementFromList, logTime } = require('../serverMaintenance');
const { DATABASE_ADMIN_DELETE_USERNAME } = require('../databases/sheetdb');
const { getUserCountById, updateItemCount } = require('../databases/dynamodb');
const { 
    botHelperInfo,
	hAdminInfo,
    commands,
	randomEmojiSuccess,
	randomEmojiError
} = require('../../storage/exportTxt');
const { 
    sendMessage,
    getUserByUsername,
    relationshipId,
    postStatusText,
    getFollowers
} = require('../twitterapi/twitterLib');
const {
	patoshi,
	fuxo,
	zejtin,
	sendHelp,
	sendInfo,
	whitelistAdd,
	blacklistAdd
} = require('./switchCommands');


/*
*   async userFollowsBot(senderId)
*	sendHelp(senderId)
*   async userBlocksBot(senderId)
*   async prenk(senderId, senderUsername, targetUsername)
*   async onNewMessage(event)
*/

const spamChecker = new antiSpam();

const userFollowsBot = async (senderId) => {
    const res = await relationshipId(senderId, process.env.BOT_ID);
    return res[0] === 1 ? true : false;
}

const userBlocksBot = async (senderId) => {
    const res = await relationshipId(process.env.BOT_ID, senderId);
    return res[0] === 2 ? false : true;
}

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
        if (!event.direct_message_events) {
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
            sendMessage(senderId, botHelperInfo + '\n' + randomElementFromList(randomEmojiSuccess) + 
                                     ' ' + randomElementFromList(randomEmojiError));
            return;
        }

        // Check if sender have enought followers (Skip for whitelist users)
        const senderIdFollowersCount = await getFollowers(senderId);
        if(!whitelist.includes(senderId) && senderIdFollowersCount < process.env.MIN_FOLLOWERS_WEBHOOK){
            sendMessage(senderId, `Nemash ni ${process.env.MIN_FOLLOWERS_WEBHOOK} folowera yadno ${randomElementFromList(randomEmojiError)}`);
            return;
        }

        // Check if user follows bot
        if(!(await userFollowsBot(senderId))){
            sendMessage(senderId, `Zaprati bota, stoko ${randomElementFromList(randomEmojiError)}`);
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

        const numOfCommandUses = await getUserCountById('daily-usage', senderId);

        if(blacklist.includes(senderId)){
            sendMessage(senderId, `Mićko banowan si ${randomElementFromList(randomEmojiError)}`);
            return;
        }else if(whitelist.includes(senderId)){
            // sendMessage(senderId, 'Brao admine si.');
        }else if(numOfCommandUses >= process.env.MAX_DAILY_USAGE){
            sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} usluge danas ${randomElementFromList(randomEmojiError)}`);
            return;
        }

        switch(splitedMsg[0]){
            case '!prenk':
                if(splitedMsg.length === 1)
                    return;
                const res = await prenk(senderId, targetId, targetUsername);
                // On successful prenk increment
                if(res === 1){
					updateItemCount('daily-usage', senderId);
                    logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) prenked @${targetUsername}`);
                }
                return;
            case '!patoshi':
                if(splitedMsg.length === 1)
                    return;
				patoshi(senderId, senderUsername, targetUsername);
                logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) patoshied @${targetUsername}`);
				return;
            case '!fuxo':
                if(splitedMsg.length === 1)
                    return;
				fuxo(senderId, senderUsername, targetUsername);
                logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed @${targetUsername}`);
                return;
            case '!zejtin':
                if(splitedMsg.length === 1)
                    return;
				zejtin(senderId, senderUsername, targetUsername);
                logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) zejtinowed @${targetUsername}`);
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
            default:
                sendMessage(senderId, botHelperInfo);
        }

    }catch(e){
        console.log("Error in ./dependencies/webhookExport/onNewMessage");
        console.log(e);
    }
}

module.exports = {
    onNewMessage
}