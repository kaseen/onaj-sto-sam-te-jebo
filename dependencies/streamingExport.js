// fs.readdirSync uses process.cwd() - current working directory of the Node.js process.
require('dotenv').config({ path: require('find-config')('.env') });
const fs = require('fs');
const { postStatusText, postStatusWithMedia } = require('./twitterLib');
const { logTime } = require('./serverMaintenance');
const { regex, provera } = require('./checkExport');
const listMention = require('../storage/listMention');

// TODO: remove
const accountsList = ['jawisemalena', 'test6bot'];

const postStreamMention = async (eventMsg) => {
	const randInt = Math.floor(Math.random()*(listMention.length));
	const https = "https://twitter.com/" + eventMsg.user.screen_name + "/status/" + eventMsg.id_str;

    const tweet = `${listMention[randInt]} ${https}`;

    try{
        await postStatusText(tweet);
        logTime(`@${eventMsg.user.screen_name} /postStreamMention`);
    }catch(e){
        console.log("Error in ./dependencies/streamingExport/postStreamMention");
        console.log(e);
    }
}

const postStreamImg = async (eventMsg) => {
    const text = "https://twitter.com/" + eventMsg.user.screen_name + "/status/" + eventMsg.id_str;

    const duzinaImgDirektorijuma = fs.readdirSync('./img').length;
    const randIntSlika = Math.floor(Math.random()*(duzinaImgDirektorijuma));
    const randSlika = "./img/" + (randIntSlika+1) + ".jpg";

    try{
        await postStatusWithMedia(text, randSlika, 'image/jpeg');
        logTime(`@${eventMsg.user.screen_name} /postStreamImg`);
    }catch(e){
        console.log("Error in ./dependencies/streamingExport/postStreamImg");
        console.log(e);
    }
}

const randPost = (eventMsg) => {
	const rand = Math.floor(Math.random()*(100));
	if(rand < Number(process.env.POST_STREAM_IMG_PERCENT))
		postStreamImg(eventMsg);
	else	
		postStreamMention(eventMsg);
}

const onDataFilterStream = (eventMsg) => {
    try{
        if(!eventMsg.text.startsWith("RT @") && !accountsList.includes(eventMsg.user.screen_name)){
            // ako je tvit zapravo quote proveri jel validan pre tvitovanja
            if(eventMsg.is_quote_status === true){
                if(!provera(regex(eventMsg.quoted_status.text)))
                    randPost(eventMsg);
            }
            else
                randPost(eventMsg);
        }
    }catch(e){
        console.log("Error in ./dependencies/streamingExport/streamFunction");
        console.log(e);
    }
}

module.exports = {
    onDataFilterStream
}