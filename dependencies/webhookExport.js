require('dotenv').config({ path: require('find-config')('.env') });
const listPrenk = require('../storage/listPrenk');
const { 
    sendMessage,
    getUserByUsername,
    relationshipId,
    relationshipUsername,
    postStatusText,
    postPatoshi,
    getFollowers,
    logTime
} = require('./twitterLib');

/*
*   async userFollowsBot(senderId)
*   async prenk(senderId, senderUsername, targetUsername)
*   async patoshi(senderId, senderUsername, targetUsername)
*   async onNewMessage(event)
*/

const userFollowsBot = async (senderId) => {
    const res = await relationshipId(senderId, process.env.BOT_ID);
    return res[0] === 1 ? true : false;
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
        logTime(`@${senderUsername} prenked @${targetUsername}`);
    }catch(e){
        console.log("Error in ./dependencies/webhookExport/patoshi");
        console.log(e);
    }

}

const patoshi = async (senderId, senderUsername, targetUsername) => {

    try{
        await postPatoshi(senderUsername, targetUsername);
        await sendMessage(senderId, `Uspeshno si patoshio @${targetUsername} swe u 16.`);
        logTime(`@${senderUsername} patoshied @${targetUsername}`);
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

        const senderIdFollowersCount = await getFollowers(senderId);
        if(senderIdFollowersCount < process.env.MIN_FOLLOWERS_WEBHOOK){
            await sendMessage(senderId, `Nemash ni ${process.env.MIN_FOLLOWERS_WEBHOOK} folowera yadno`);
            return;
        }

        const splitedMsg = text.split(' ');
        const targetUsername = splitedMsg[1];

        if(splitedMsg.length === 1 && (splitedMsg[0] !== '/prenk' || splitedMsg[0] !== '/patoshi')){
            await sendMessage(senderId, 'Dostupne komande:\n/prenk <username>\n/patoshi <username>');
            return;
        }

        if(!(await userFollowsBot(senderId))){
            await sendMessage(senderId, 'Zaprati bota, stoko');
            return;
        }

        if((await getUserByUsername(targetUsername)) === '-1'){
            await sendMessage(senderId, `Mićko @${targetUsername} ne postoji`);
            return;
        }

        switch(splitedMsg[0]){
            case '/prenk':
                if(dailyStorageInstance.getId(senderId) >= process.env.MAX_DAILY_USAGE){
                    //await sendMessage(senderId, `Wec si prenkovao ${process.env.MAX_PRENK_PER_DAY} puta danas`);
                    await sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} prenka/patosha danas`);
                    break;
                }
                await prenk(senderId, senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
                break;
            case '/patoshi':
                if(dailyStorageInstance.getId(senderId) >= process.env.MAX_DAILY_USAGE){
                    //await sendMessage(senderId, `Wec si patoshio ${process.env.MAX_PATOSHI_PER_DAY} patoshenja danas`);
                    await sendMessage(senderId, `Wec si iskoristio ${process.env.MAX_DAILY_USAGE} prenka/patosha danas`);
                    break;
                }                                    
                await patoshi(senderId, senderUsername, targetUsername);
                dailyStorageInstance.incrementId(senderId);
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