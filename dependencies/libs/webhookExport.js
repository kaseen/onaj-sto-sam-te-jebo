require('dotenv').config({ path: require('find-config')('.env') });
const listPrenk = require('../../storage/listPrenk');
const { antiSpam, logTime } = require('../serverMaintenance');
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

const botHelperInfo = 'Dostupne komande:\n!prenk <username>\n!patoshi <username>\n!fuxo <username>\n!zejtin <username>';
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
        await sendMessage(senderId, `Mićko @${targetUsername} ne postoji`);
        return 0;
    }
    if(result[0] === 0){
        await sendMessage(senderId, 'Ne pratish mićka');
        return 0;
    }
    if(result[1] === 0){
        await sendMessage(senderId, 'Mićko te ne prati');
        return 0;
    }

    const randInt = Math.floor(Math.random()*(listPrenk.length));
    const text = `@${targetUsername}\n\n${listPrenk[randInt]}\n\nPrenk 🤙🤙🤙`;

    try{
        await postStatusText(text);
        await sendMessage(senderId, `Uspeshno si prenkowo @${targetUsername} swe u 16.`);
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
                await sendMessage(senderId, 'Sachekaj bota bote (spam protection)');
            }
            spamChecker.setWarning(senderId);
            return;
        }
        spamChecker.incrementId(senderId);

        // Check valid commands
        const splitedMsg = text.split(' ');
        const targetUsername = splitedMsg[1];

        if(splitedMsg.length === 1 && (
            splitedMsg[0] !== '!prenk' || 
            splitedMsg[0] !== '!patoshi' ||
            splitedMsg[0] !== '!fuxo' ||
            splitedMsg[0] !== '!zejtin'
        )){
            await sendMessage(senderId, botHelperInfo);
            return;
        }

        // Check if sender have enought followers
        const senderIdFollowersCount = await getFollowers(senderId);
        if(senderIdFollowersCount < process.env.MIN_FOLLOWERS_WEBHOOK){
            await sendMessage(senderId, `Nemash ni ${process.env.MIN_FOLLOWERS_WEBHOOK} folowera yadno`);
            return;
        }

        // Check if user follows bot
        if(!(await userFollowsBot(senderId))){
            await sendMessage(senderId, 'Zaprati bota, stoko');
            return;
        }

        // Check if targetUsername exists
        const targetInfo = await getUserByUsername(targetUsername);
        const targetId = targetInfo.id_str;
        if(targetId === '-1'){
            await sendMessage(senderId, `Mićko @${targetUsername} ne postoji`);
            return;
        }

        // Check if target blocks bot
        if(!(await userBlocksBot(targetId))){
            await sendMessage(senderId, 'Mićko blokiro bota xd');
            return;
        }

        const _numOfBotUses = dailyStorageInstance.getId(senderId);
        const numOfBotUses = isNaN(_numOfBotUses) ? 0 : _numOfBotUses;    

        if(numOfBotUses >= process.env.MAX_DAILY_USAGE){
            await sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} usluge danas`);
            return;
        }

        switch(splitedMsg[0]){
            case '!prenk':
                const res = await prenk(senderId, targetId, targetUsername);
                // On successful prenk increment
                if(res === 1){
                    dailyStorageInstance.incrementId(senderId);
                    logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) prenked @${targetUsername}`);
                }
                break;
            case '!patoshi':
                sendMessage(senderId, 'Sachekaj sekundu lutko');
                await postVideoMethod('patoshi', senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                await sendMessage(senderId, `Uspeshno si patoshio @${targetUsername} swe u 16.`);
                logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) patoshied @${targetUsername}`);
                break;
            case '!fuxo':                       
                sendMessage(senderId, 'Sachekaj sekundu lutko');         
                await postVideoMethod('fuxo', senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                await sendMessage(senderId, `Uspeshno si fuxowao @${targetUsername} swe u 16.`);
                logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed @${targetUsername}`);
                break;
            case '!zejtin':
                sendMessage(senderId, 'Sachekaj sekundu lutko');
                await postVideoMethod('zejtin', senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                await sendMessage(senderId, `Uspeshno si zejtinowo @${targetUsername} swe u 16.`);
                logTime(`@${senderUsername}(${numOfBotUses+1}/${process.env.MAX_DAILY_USAGE}) zejtinowed @${targetUsername}`);
                break;
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