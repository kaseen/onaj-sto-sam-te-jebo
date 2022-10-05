const { TwitterClient } = require('../Instances');
const { randomElementFromList } = require('../serverMaintenance');
const { randomEmojiError } = require('../../storage/exportTxt');
const fs = require('fs');

/* 
*   async sendMessage(recipientId, text)
*   async getUserByUsername(username)
*   async relationshipId(senderId, targetId)
*   async postStatusText(text)
*   async postStatusWithMedia(text, mediaPath)
*   async postVideoMethod(method, senderUsername, targetUsername)
*   async getFollowers(senderId)
*/

const methodtoVideoMap = {
    'patoshi': './vid/cutepatosem.mp4',
    'fuxo': './vid/fuxo.mp4',
    'zejtin': './vid/zejtin.mp4'
};

const sendMessage = async (recipientId, text) => {

    try{
        await TwitterClient.v1.sendDm({ recipient_id: recipientId, text: text });
    }catch(e){
        console.log("Error in ./dependencies/twitterLib/sendMessage");
        console.log(e);
    }
}

const getUserByUsername = async (username) => {
    try{
        const res = await TwitterClient.v1.user({ screen_name: username });
        return res;
    }catch(e){
        // User not found
        const error = {id_str: '-1'};
        return error;
    }
}

const relationshipId = async (senderId, targetId) => {

    try{
        const res  = await TwitterClient.v1.friendship({ source_id: senderId, target_id: targetId });

        const heFollows = res.relationship.source.following === true ? 1 : 0;
        const heIsFollowed = res.relationship.source.followed_by === true ? 1 : 0;

        const heIsBlocked = res.relationship.source.blocked_by;
        if(heIsBlocked){
            return [2, 0];
        }

        return [
            heFollows,
            heIsFollowed
        ];

    }catch(e){
        // Return [-1, -1] if user not found
        return [-1, -1];
    }
}

const postStatusText = async (text) => {
    try{
        await TwitterClient.v1.tweet(text);
    }catch(e){
        console.log("Error in ./dependencies/twitterLib/postStatusText");
        return;
    }
}

const postStatusWithMedia = async (text, mediaPath, mimeType) => {
    try{
        const filePath = fs.readFileSync(mediaPath);
        const mediaId = await TwitterClient.v1.uploadMedia(filePath, { mimeType: mimeType });
        if(mimeType === 'image/jpeg'){
            await TwitterClient.v1.createMediaMetadata(mediaId, { alt_text: { text: 'prenk xd' } });
        }
        await TwitterClient.v1.tweet(text, { media_ids: mediaId });
    } catch(e){
        console.log("Error in ./dependencies/twitterLib/postStatusWithMedia");
        console.log(e);
        return;
    }
}

const postVideoMethod = async (method, senderUsername, targetUsername) => {

    const video_path = methodtoVideoMap[method];
    if (typeof(video_path) === 'undefined'){
        return;
    }
    const text = `@${targetUsername}\n\nXalo kurajberu ${randomElementFromList(randomEmojiError)}, @${senderUsername} ti poruchuje:`;
    try{
        await postStatusWithMedia(text, video_path, 'video/mp4');
    }catch(e){
        console.log("Error in ./dependencies/twitterLib/postVideoMethod");
        console.log(e);
        return;
    }
}

const getFollowers = async (senderId) => {
    try{
        const res = await TwitterClient.v1.user({ user_id: senderId });
        return res.followers_count;
    }catch(e){
        // User not found
        return -1;
    }
}

module.exports = {
    sendMessage,
    getUserByUsername,
    relationshipId,
    postStatusText,
    postStatusWithMedia,
    postVideoMethod,
    getFollowers
}