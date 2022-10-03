require('dotenv').config({ path: require('find-config')('.env') });
const listPrenk = require('../../storage/listPrenk');
const { antiSpam, readBotInfoTxt, importFromFile, addToEndOfFile, logTime } = require('../serverMaintenance');
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

const whitelist = importFromFile('./storage/txt/whitelist.txt');
const blacklist = importFromFile('./storage/txt/blacklist.txt');
const commands = importFromFile('./storage/txt/commands.txt');

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
        postStatusText(text)
            .then(() => sendMessage(senderId, `Uspeshno si prenkowo @${targetUsername} swe u 16.`));
        
    }catch(e){
        console.log("Error in ./dependencies/webhookExport/patoshi");
        console.log(e);
    }

    // If success return 1 (needed for dailyStorageInstance)
    return 1;
}

const onNewMessage = async (dailyStorageInstance, timestamp, event) => {
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
            // If it's spam sendMessage
            if(!spamChecker.getWarning(senderId)){
                sendMessage(senderId, 'Sachekaj bota bote (spam protection)');
            }

            // Disable sending message in this block of spam
            spamChecker.setWarning(senderId);
            return;
        }

        // Check valid commands
        const splitedMsg = text.split(' ');
        const targetUsername = splitedMsg[1];

        if(!commands.includes(splitedMsg[0])){
            sendMessage(senderId, botHelperInfo);
            return;
        }

        // Check if sender have enought followers (Skip for whitelist users)
        const senderIdFollowersCount = await getFollowers(senderId);
        if(!whitelist.includes(senderId) && senderIdFollowersCount < process.env.MIN_FOLLOWERS_WEBHOOK){
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

        const _numOfCommandUses = dailyStorageInstance.getId(senderId);
        const numOfCommandUses = isNaN(_numOfCommandUses) ? 0 : _numOfCommandUses;    

        if(blacklist.includes(senderId)){
            sendMessage(senderId, 'Mićko banowan si.');
            return;
        }else if(whitelist.includes(senderId)){
            //sendMessage(senderId, 'Brao admine si.');
        }else if(numOfCommandUses >= process.env.MAX_DAILY_USAGE){
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
                    logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) prenked @${targetUsername}`);
                }
                return;
            case '!patoshi':
                if(splitedMsg.length === 1)
                    return;
                sendMessage(senderId, 'Sachekaj sekundu lutko');
                postVideoMethod('patoshi', senderUsername, targetUsername)
                    .then(() => sendMessage(senderId, `Uspeshno si patoshio @${targetUsername} swe u 16`));
                dailyStorageInstance.incrementId(senderId);
                logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) patoshied @${targetUsername}`);
                return;
            case '!fuxo':
                if(splitedMsg.length === 1)
                    return;                     
                sendMessage(senderId, 'Sachekaj sekundu lutko');         
                postVideoMethod('fuxo', senderUsername, targetUsername)
                    .then(() => sendMessage(senderId, `Uspeshno si fuxowao @${targetUsername} swe u 16.`));
                dailyStorageInstance.incrementId(senderId);
                logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed @${targetUsername}`);
                return;
            case '!zejtin':
                if(splitedMsg.length === 1)
                    return;
                sendMessage(senderId, 'Sachekaj sekundu lutko');
                postVideoMethod('zejtin', senderUsername, targetUsername)
                    .then(() => sendMessage(senderId, `Uspeshno si zejtinowo @${targetUsername} swe u 16.`));
                dailyStorageInstance.incrementId(senderId);
                logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) zejtinowed @${targetUsername}`);
                return;
            case '!info':
                //TODO
                console.log('INFO TODO');
                return;

            // HEAD ADMIN COMMANDS
            case '!admin':
                if(senderId === process.env.HEAD_ADMIN_ID){
                    const map = dailyStorageInstance.getMap();
                    let msg = '';
                    for (const [key, value] of map) {
                        msg += `${key} ${value}\n`
                    }
                    msg !== '' ? sendMessage(senderId, msg) : sendMessage(senderId, 'Map empty.');
                }
                return;
            case '!white':
                if(splitedMsg.length === 1)
                    return;  
                if(senderId === process.env.HEAD_ADMIN_ID){
                    getUserByUsername(targetUsername)
                        .then((res) => {
                            whitelist.push(res.id_str);
                            addToEndOfFile('./storage/txt/whitelist.txt', res.id_str);
                            sendMessage(senderId, `@${targetUsername} (ID: ${res.id_str}) added to whitelist.`);
                        });
                }
                return;
            case '!black':
                if(splitedMsg.length === 1)
                    return;  
                if(senderId === process.env.HEAD_ADMIN_ID){
                    getUserByUsername(targetUsername)
                        .then((res) => {
                            whitelist.push(res.id_str);
                            addToEndOfFile('./storage/txt/blacklist.txt', res.id_str);
                            sendMessage(senderId, `@${targetUsername} (ID: ${res.id_str}) added to blacklist.`);
                        });
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