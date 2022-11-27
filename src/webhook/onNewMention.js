require('dotenv').config({ path: require('find-config')('.env') });
const { randomElementFromList, logTime } = require('../serverMaintenance');
const { sendMessage, userBlocksBot } = require('../twitterapi/twitterLib');
const { randomEmojiSuccess, randomEmojiError } = require('../../storage/exportTxt');
const { getUserCountById } = require('../databases/dynamodb');
const { checkUser } = require('./checkUser');
const { 
	patoshi,
	fuxo,
	fuxo2,
	zejtin,
	mali,
	pipni,
	mani,
	shala,
	kurwo,
	pojebemo,
	cigan,
	ubije
} = require('./switchCommands');

/*
*	async onNewMention(event, whitelist, blacklist)
*/

const onNewMention = async (event, whitelist, blacklist) => {
	try{
		// We check that the event is a mention
		if(!event.tweet_create_events){
			return;
		}

		// Check if tweet is reply is null (null == undefined, code will catch both null and undefined.)
		if(event.tweet_create_events[0].in_reply_to_status_id_str === null){
			return;
		}

		const myId = event.for_user_id;
		const targetId = event.tweet_create_events[0].in_reply_to_user_id_str;
		const senderId = event.tweet_create_events[0].user.id_str;
		const text = event.tweet_create_events[0].text;
		const senderUsername = event.tweet_create_events[0].user.screen_name;
		const targetUsername = event.tweet_create_events[0].in_reply_to_screen_name;
		const tweetId = event.tweet_create_events[0].in_reply_to_status_id_str;

		// Skip using commands on self
		if(myId === targetId){
			return;
		}

		// Avoiding infinite loop
		if(myId === senderId){
			return;
		}

		// Check user criteria
		const userCheck = await checkUser(senderId, whitelist, blacklist);
		if(userCheck === false)
			return;

		const numOfCommandUses = await getUserCountById('daily-usage', senderId);

		// Check if target blocks bot
		if(!(await userBlocksBot(targetId))){
			sendMessage(senderId, `Mićko blokiro bota ${randomElementFromList(randomEmojiError)}`);
			return;
		}

		// Split message and find command (what starts with !)
		const splitedMsg = text.split(' ');

		let command = null;
		splitedMsg.every((elem) => {
			if(elem.startsWith('!')){
				command = elem;
				return false;
			}else if(elem.startsWith('/')){
				command = elem;
				return false;
			}
			return true;
		});

		if(command === null){
			return;
		}

		// Tweet text for mention (two smileys)
		const M_textTweet = `${randomElementFromList(randomEmojiSuccess)}${randomElementFromList(randomEmojiError)}`;

		// Tweet text for quote (two smileys)
		const Q_textTweet = M_textTweet + `\nhttps://twitter.com/${targetUsername}/status/${tweetId}`;

		switch(command){
			case '!patoshi':
				patoshi(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) patoshied(Q) @${targetUsername}`);
				return;
			case '/patoshi':
				patoshi(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) patoshied(M) @${targetUsername}`);
				return;

			case '!fuxo':
				fuxo(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed(Q) @${targetUsername}`);
				return;
			case '/fuxo':
				fuxo(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed(M) @${targetUsername}`);
				return;

			case '!fuxo2':
				fuxo2(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed2(Q) @${targetUsername}`);
				return;
			case '/fuxo2':
				fuxo2(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) fuxoed2(M) @${targetUsername}`);
				return;
			
			case '!zejtin':
				zejtin(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) zejtinowed(Q) @${targetUsername}`);
				return;
			case '/zejtin':
				zejtin(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) zejtinowed(M) @${targetUsername}`);
				return;

			case '!mali':
				mali(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) malowed(Q) @${targetUsername}`);
				return;
			case '/mali':
				mali(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) malowed(M) @${targetUsername}`);
				return;
			
			case '!pipni':
				pipni(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) pipnowed(Q) @${targetUsername}`);
				return;
			case '/pipni':
				pipni(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) pipnowed(M) @${targetUsername}`);
				return;
			
			case '!mani':
				mani(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) maniowed(Q) @${targetUsername}`);
				return;
			case '/mani':
				mani(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) maniowed(M) @${targetUsername}`);
				return;
			
			case '!shala':
				shala(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) shalowed(Q) @${targetUsername}`);
				return;
			case '/shala':
				shala(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) shalowed(M) @${targetUsername}`);
				return;
			
			case '!kurwo':
			case '!kurvo':
				kurwo(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) kurwowed(Q) @${targetUsername}`);
				return;
			case '/kurwo':
			case '/kurvo':
				kurwo(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) kurwowed(M) @${targetUsername}`);
				return;
			
			case '!pojebemo':
				pojebemo(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) pojebemoed(Q) @${targetUsername}`);
				return;
			case '/pojebemo':
				pojebemo(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) pojebemoed(M) @${targetUsername}`);
				return;

			case '!cigan':
				cigan(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) ciganowed(Q) @${targetUsername}`);
				return;
			case '/cigan':
				cigan(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) ciganowed(M) @${targetUsername}`);
				return;

			case '!ubije':
				ubije(senderId, targetUsername, Q_textTweet, '0');
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) ubiowed(Q) @${targetUsername}`);
				return;
			case '/ubije':
				ubije(senderId, targetUsername, M_textTweet, tweetId);
				logTime(`@${senderUsername}(${numOfCommandUses+1}/${process.env.MAX_DAILY_USAGE}) ubiowed(M) @${targetUsername}`);
				return;
			
			default:
				return;
		}

	}catch(e){
		console.log("Error in ./dependencies/onNewMention");
		console.log(e);
	}
}

module.exports = {
	onNewMention
}