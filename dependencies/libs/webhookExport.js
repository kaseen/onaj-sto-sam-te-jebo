require('dotenv').config({ path: require('find-config')('.env') });
const listPrenk = require('../../storage/listPrenk');
const { antiSpam, logTime, readBotInfoTxt } = require('../serverMaintenance');
const { 
    sendMessage,
    getUserByUsername,
    relationshipId,
    postStatusText,
    postVideoMethod,
    getFollowers
} = require('./twitterLib');

/*
*   async userFollowsBot(senderId)
*   async userBlocksBot(senderId)
*   async prenk(senderId, senderUsername, targetUsername)
*   async onNewMessage(dailyStorageInstance, event)
*/

const botHelperInfo = readBotInfoTxt('./storage/botInfo.txt');
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
        sendMessage(senderId, `Mićko @${targetUsername} ne postoji`);
        return 0;
    }
    if(result[0] === 0){
        sendMessage(senderId, 'Ne pratish mićka');
        return 0;
    }
    if(result[1] === 0){
        sendMessage(senderId, 'Mićko te ne prati');
        return 0;
    }

    const randInt = Math.floor(Math.random()*(listPrenk.length));
    const text = `@${targetUsername}\n\n${listPrenk[randInt]}\n\nPrenk 🤙🤙🤙`;

    try{
        await postStatusText(text);
        sendMessage(senderId, `Uspeshno si prenkowo @${targetUsername} swe u 16.`);
    }catch(e){
        console.log("Error in ./dependencies/webhookExport/patoshi");
        console.log(e);
    }

    // If success return 1 (needed for dailyStorageInstance)
    return 1;
}

const onNewMessage = async (dailyStorageInstance, event) => {
    try{
        // We check that the event is a direct message
        if (!event.direct_message_events) {
            return;
        }

        const myId = event.for_user_id;
        const senderId = event.direct_message_events[0].message_create.sender_id;
        const senderUsername = event.users[senderId].screen_name;
        const text = event.direct_message_events[0].message_create.message_data.text;
        
        // Avoiding infinite loop
        if(senderId === myId){
            return;
        }

        // Anti spam checker
        if(spamChecker.checkSpam(senderId)){
            if(!spamChecker.getWarning(senderId)){
                sendMessage(senderId, 'Sachekaj bota bote (spam protection)');
            }
            spamChecker.setWarning(senderId);
            return;
        }
        spamChecker.incrementId(senderId);

        // Check valid commands
        const splitedMsg = text.split(' ');
        const targetUsername = splitedMsg[1];

        // Check if sender have enought followers
        const senderIdFollowersCount = await getFollowers(senderId);
        if(senderIdFollowersCount < process.env.MIN_FOLLOWERS_WEBHOOK){
            sendMessage(senderId, `Nemash ni ${process.env.MIN_FOLLOWERS_WEBHOOK} folowera yadno`);
            return;
        }

        // Check if user follows bot
        if(!(await userFollowsBot(senderId))){
            sendMessage(senderId, 'Zaprati bota, stoko');
            return;
        }

        // Check if targetUsername exists
        const targetInfo = await getUserByUsername(targetUsername);
        const targetId = targetInfo.id_str;
        if(splitedMsg.length !== 1 && targetId === '-1'){
            sendMessage(senderId, `Mićko @${targetUsername} ne postoji`);
            return;
        }

        // Check if target blocks bot
        if(!(await userBlocksBot(targetId))){
            sendMessage(senderId, 'Mićko blokiro bota xd');
            return;
        }

        const _numOfBotUses = dailyStorageInstance.getId(senderId);
        const numOfBotUses = isNaN(_numOfBotUses) ? 0 : _numOfBotUses;    

        if(numOfBotUses >= process.env.MAX_DAILY_USAGE){
            sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} usluge danas`);
            return;
        }

        switch(splitedMsg[0]){
            case '!prenk':
                if(splitedMsg.length === 1)
                    return;
                const res = await prenk(senderId, targetId, targetUsername);
                // On successful prenk increment
                if(res === 1){
                    dailyStorageInstance.incrementId(senderId);
                    logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) prenked @${targetUsername}`);
                }
                return;
            case '!patoshi':
                if(splitedMsg.length === 1)
                    return;
                sendMessage(senderId, 'Sachekaj sekundu lutko');
                await postVideoMethod('patoshi', senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                await sendMessage(senderId, `Uspeshno si patoshio @${targetUsername} swe u 16.`);
                logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) patoshied @${targetUsername}`);
                return;
            case '!fuxo':
                if(splitedMsg.length === 1)
                    return;                     
                sendMessage(senderId, 'Sachekaj sekundu lutko');         
                await postVideoMethod('fuxo', senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                await sendMessage(senderId, `Uspeshno si fuxowao @${targetUsername} swe u 16.`);
                logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed @${targetUsername}`);
                return;
            case '!zejtin':
                if(splitedMsg.length === 1)
                    return;
                sendMessage(senderId, 'Sachekaj sekundu lutko');
                await postVideoMethod('zejtin', senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                await sendMessage(senderId, `Uspeshno si zejtinowo @${targetUsername} swe u 16.`);
                logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) zejtinowed @${targetUsername}`);
                return;
            case '!info':
                //TODO
                console.log('INFO');
                return;
            case '!admin':
                if(senderId === '1059478209115406336'){
                    const map = dailyStorageInstance.getMap();
                    let msg = '';
                    for (const [key, value] of map) {
                        msg += `${key} ${value}\n`
                    }
                    msg !== '' ? sendMessage(senderId, msg) : sendMessage(senderId, 'Map empty');
                }
                return;
            default:
                await sendMessage(senderId, botHelperInfo);
        }

    }catch(e){
        console.log("Error in ./dependencies/webhookExport/onNewMessage");
        console.log(e);
    }
}

module.exports = {
    onNewMessage
}