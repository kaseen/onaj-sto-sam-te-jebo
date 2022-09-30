require('dotenv').config({ path: require('find-config')('.env') });
const listPrenk = require('../storage/listPrenk');
const { logTime } = require('./serverMaintenance');
const { 
    sendMessage,
    getUserByUsername,
    relationshipId,
    relationshipUsername,
    postStatusText,
    postPatoshi,
    getFollowers,
} = require('./twitterLib');

/*
*   async userFollowsBot(senderId)
*   async userBlocksBot(senderId)
*   async prenk(senderId, senderUsername, targetUsername)
*   async patoshi(senderId, senderUsername, targetUsername)
*   async onNewMessage(event)
*/

const userFollowsBot = async (senderId) => {
    const res = await relationshipId(senderId, process.env.BOT_ID);
    return res[0] === 1 ? true : false;
}

const userBlocksBot = async (senderId) => {
    const res = await relationshipId(process.env.BOT_ID, senderId);
    return res[0] === 2 ? false : true;
}

const prenk = async (senderId, senderUsername, targetUsername) => {

    const result = await relationshipUsername(senderUsername, targetUsername);

    if(result[0] === -1){
        await sendMessage(senderId, `Mićko @${targetUsername} ne postoji`);
        return;
    }
    if(result[0] === 0){
        await sendMessage(senderId, 'Ne pratish mićka');
        return;
    }
    if(result[1] === 0){
        await sendMessage(senderId, 'Mićko te ne prati');
        return;
    }

    const randInt = Math.floor(Math.random()*(listPrenk.length));
    const text = `${targetUsername}\n\n${listPrenk[randInt]}\n\nPrenk 🤙🤙🤙`;

    try{
        await postStatusText(text);
        await sendMessage(senderId, `Uspeshno si prenkowo @${targetUsername} swe u 16.`);
    }catch(e){
        console.log("Error in ./dependencies/webhookExport/patoshi");
        console.log(e);
    }

}

const patoshi = async (senderId, senderUsername, targetUsername) => {

    try{
        await postPatoshi(senderUsername, targetUsername);
        await sendMessage(senderId, `Uspeshno si patoshio @${targetUsername} swe u 16.`);
    }catch(e){
        console.log("Error in ./dependencies/webhookExport/patoshi");
        console.log(e);
    }

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

        const splitedMsg = text.split(' ');
        const targetUsername = splitedMsg[1];

        if(splitedMsg.length === 1 && (splitedMsg[0] !== '/prenk' || splitedMsg[0] !== '/patoshi')){
            await sendMessage(senderId, 'Dostupne komande:\n/prenk <username>\n/patoshi <username>');
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

        switch(splitedMsg[0]){
            case '/prenk':
                const numPrenk = dailyStorageInstance.getId(senderId);
                if(numPrenk >= process.env.MAX_DAILY_USAGE){
                    //await sendMessage(senderId, `Wec si prenkovao ${process.env.MAX_PRENK_PER_DAY} puta danas`);
                    await sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} prenka/patosha danas`);
                    break;
                }
                await prenk(senderId, senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                logTime(`@${senderUsername}(${numPrenk+1}/${process.env.MAX_DAILY_USAGE}) patoshied @${targetUsername}`);
                break;
            case '/patoshi':
                const numPatoshi = dailyStorageInstance.getId(senderId);
                if(numPatoshi >= process.env.MAX_DAILY_USAGE){
                    //await sendMessage(senderId, `Wec si patoshio ${process.env.MAX_PATOSHI_PER_DAY} patoshenja danas`);
                    await sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} prenka/patosha danas`);
                    break;
                }                                    
                await patoshi(senderId, senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                logTime(`@${senderUsername}(${numPatoshi+1}/${process.env.MAX_DAILY_USAGE}) patoshied @${targetUsername}`);
                break;
            default:
                await sendMessage(senderId, 'Dostupne komande:\n/prenk <username>\n/patoshi <username>')
        }

    }catch(e){
        console.log("Error in ./dependencies/webhookExport/onNewMessage");
        console.log(e);
    }
}

module.exports = {
    onNewMessage,
    prenk,
    patoshi
}