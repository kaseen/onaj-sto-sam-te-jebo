const { TwitterClient } = require('./Instances');
const fs = require("fs");

/* 
*   async sendMessage(recipientId, text)
*   async getUserByUsername(username)
*   async relationshipId(senderId, targetId)
*   async relationshipUsername(senderUsername, targetUsername)
*   async postStatusText(text)
*   async postStatusWithMedia(text, mediaPath)
*   async postPatoshi(senderUsername, targetUsername)
*   async getFollowers(senderId)
*/

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

        return [
            heFollows,
            heIsFollowed
        ];

    }catch(e){
        // Return [-1, -1] if user not found
        return [-1, -1];
    }
}

const relationshipUsername = async (senderUsername, targetUsername) => {

    const _senderUsername = (await getUserByUsername(senderUsername)).id_str;
    const _targetUsername = (await getUserByUsername(targetUsername)).id_str;

    const x = await relationshipId(_senderUsername, _targetUsername);

    return x;
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

const postPatoshi = async (senderUsername, targetUsername) => {

    const text = `@${targetUsername}\n\nXalo kurajberu, @${senderUsername} ti poruchuje:`;
    const PATOSHI_MP4_PATH = './vid/cutepatosem.mp4';

    try{
        await postStatusWithMedia(text, PATOSHI_MP4_PATH, 'video/mp4');
    }catch(e){
        console.log("Error in ./dependencies/twitterLib/postPatoshi");
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


Date.prototype.today = function () { 
    return (
        ((this.getDate() < 10) ? '0' : '') + 
        this.getDate() + '/' + (((this.getMonth() + 1) < 10) ? '0' : '') + 
        (this.getMonth() + 1) + '/' + this.getFullYear()
    );
}

Date.prototype.timeNow = function () {
    return (
        ((this.getHours() < 10) ? '0' : '') + this.getHours() + ':' + 
        ((this.getMinutes() < 10) ? '0' : '') + this.getMinutes() + ':' + 
        ((this.getSeconds() < 10) ? '0' : '') + this.getSeconds()
    )
}

module.exports = {
    sendMessage,
    getUserByUsername,
    relationshipId,
    relationshipUsername,
    postStatusText,
    postStatusWithMedia,
    postPatoshi,
    getFollowers
}