const fs = require('fs');
const { TwitterClient } = require('../initInstances');

/*
*	async sendMessage(recipientId, text)
*	async getUserByUsername(username)
*	async relationshipId(senderId, targetId)
*	async postStatusText(text)
*	async replyToTweet(text, tweetId)
*	async postStatusWithMedia(text, mediaPath)
*	async postVideoMethod(method, senderUsername, targetUsername)
*	async getFollowers(senderId)
*	async userFollowsBot(senderId)
*	async userBlocksBot(senderId)
*/

const methodtoVideoMap = {
	'patoshi': './vid/cutepatosem.mp4',
	'fuxo': './vid/fuxo.mp4',
	'fuxo2': './vid/fuxo2.mp4',
	'zejtin': './vid/zejtin.mp4',
	'mali': './vid/mali.mp4',
	'pipni': './vid/pipni.mp4',
	'mani': './vid/mani.mp4',
	'shala': './vid/shala.mp4',
	'kurwo': './vid/kurwo.mp4',
	'pojebemo': './vid/pojebemo.mp4',
	'cigan': './vid/cigan.mp4'
};

const sendMessage = async (recipientId, text, command) => {
	try{
		if (typeof (command) === 'undefined'){
			await TwitterClient.v1.sendDm({ recipient_id: recipientId, text: text });
		}else{
			// For preview in onNewMessage
			const mediaId = await TwitterClient.v1.uploadMedia(
				methodtoVideoMap[command],
				{ mimeType: 'video/mp4', target: 'dm' }
			);
			await TwitterClient.v1.sendDm({
				recipient_id: recipientId,
				text: text,
				attachment: { type: 'media', media: { id: mediaId } }
			});
		}
	}catch(e){
		// Not valid methodtoVideoMap, skip
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

const replyToTweet = async (text, tweetId) => {
	try{
		await TwitterClient.v1.reply(text, tweetId);
	}catch(e){
		console.log("Error in ./dependencies/twitterLib/replyToTweet");
		console.log(e);
	}
}

// replyTo = 0 tweet, else reply to that id 
const postStatusWithMedia = async (text, mediaPath, mimeType, replyTo) => {
	try{
		const filePath = fs.readFileSync(mediaPath);
		const mediaId = await TwitterClient.v1.uploadMedia(filePath, { mimeType: mimeType });
		if(mimeType === 'image/jpeg'){
			await TwitterClient.v1.createMediaMetadata(mediaId, { alt_text: { text: 'prenk xd' } });
		}
		if(replyTo === '0'){
			await TwitterClient.v1.tweet(text, { media_ids: mediaId });
		}else{
			await TwitterClient.v1.reply(text, replyTo, { media_ids: mediaId });
		}
	} catch(e){
		console.log("Error in ./dependencies/twitterLib/postStatusWithMedia");
		console.log(e);
		return;
	}
}

const postVideoMethod = async (method, text, replyTo) => {

	const video_path = methodtoVideoMap[method];
	if (typeof(video_path) === 'undefined'){
		return;
	}
	try{
		await postStatusWithMedia(text, video_path, 'video/mp4', replyTo);
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

const userFollowsBot = async (senderId) => {
	const res = await relationshipId(senderId, process.env.BOT_ID);
	return res[0] === 1 ? true : false;
}

const userBlocksBot = async (senderId) => {
	const res = await relationshipId(process.env.BOT_ID, senderId);
	return res[0] === 2 ? false : true;
}

module.exports = {
	sendMessage,
	getUserByUsername,
	relationshipId,
	postStatusText,
	replyToTweet,
	postStatusWithMedia,
	postVideoMethod,
	getFollowers,
	userFollowsBot,
	userBlocksBot
}