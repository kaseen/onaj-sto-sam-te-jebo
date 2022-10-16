// fs.readdirSync uses process.cwd() - current working directory of the Node.js process.
require('dotenv').config({ path: require('find-config')('.env') });
const fs = require('fs');
const { postStatusText, postStatusWithMedia } = require('../twitterapi/twitterLib');
const { regex, provera } = require('./checkExport');
const { logTime } = require('../serverMaintenance');
const listMention = require('../../storage/listMention');

/*
*   async postStreamMention(tweetUsername, tweetId)
*   async postStreamImg(tweetUsername, tweetId)
*   randPost(tweetUsername, tweetId)
*   onDataFilterStream(eventMsg)
*/

const postStreamMention = async (tweetUsername, tweetId) => {
	const randInt = Math.floor(Math.random()*(listMention.length));
	const https = "https://twitter.com/" + tweetUsername + "/status/" + tweetId;

    const tweet = `${listMention[randInt]} ${https}`;

    try{
        postStatusText(tweet);
        logTime(`@${tweetUsername} /postStreamMention`);
    }catch(e){
        console.log("Error in ./dependencies/libs/streamingExport/postStreamMention");
        console.log(e);
    }
}

const postStreamImg = async (tweetUsername, tweetId) => {
    const text = "https://twitter.com/" + tweetUsername + "/status/" + tweetId;

    const duzinaImgDirektorijuma = fs.readdirSync('./img').length;
    const randIntSlika = Math.floor(Math.random()*(duzinaImgDirektorijuma));
    const randSlika = "./img/" + (randIntSlika+1) + ".jpg";

    try{
        postStatusWithMedia(text, randSlika, 'image/jpeg', '0');
        logTime(`@${tweetUsername} /postStreamImg`);
    }catch(e){
        console.log("Error in ./dependencies/libs/streamingExport/postStreamImg");
        console.log(e);
    }
}

const randPost = (tweetUsername, tweetId) => {
	const rand = Math.floor(Math.random()*(100));
	if(rand < Number(process.env.POST_STREAM_IMG_PERCENT))
		postStreamImg(tweetUsername, tweetId);
	else	
		postStreamMention(tweetUsername, tweetId);
}

const onDataFilterStream = (eventMsg) => {
    const tweetText = eventMsg.data.text;
    const tweetUsername = eventMsg.includes.users[0].username;
    const tweetId = eventMsg.data.id;

    // If tweet is a retweet skip
    if(tweetText.startsWith('RT @')){
        return;
    }

    // If tweet is from this bot
    if(tweetUsername === 'jawisemalena'){
        return;
    }

    // Check if tweet is a quote
    let isQuote = false;
    try{
        const x = eventMsg.includes.tweets[0].referenced_tweets;
        if(typeof x !== 'undefined'){
            isQuote = true;
        }
    }catch(e){}

    try{
        if(isQuote){
            if(provera(regex(tweetText))){
                randPost(tweetUsername, tweetId);
            }
        }
        else{
            randPost(tweetUsername, tweetId);
        }
        
    }catch(e){
        console.log("Error in ./dependencies/libs/streamingExport/streamFunction");
        console.log(e);
    }
}

module.exports = {
    onDataFilterStream
}