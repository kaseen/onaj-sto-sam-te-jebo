require('dotenv').config({ path: require('find-config')('.env') });

const { botHelp, randomEmojiSuccess, randomEmojiError, waitForBot } = require('../../storage/exportTxt');
const { sendMessage, getUserByUsername, postVideoMethod } = require('../twitterapi/twitterLib');
const { randomElementFromList, logTime } = require('../serverMaintenance');
const { DATABASE_ADMIN_ADD } = require('../databases/sheetdb');
const { updateItemCount } = require('../databases/dynamodb');

const patoshi = (senderId, targetUsername, text, replyTo) => {
	updateItemCount('daily-usage', senderId);
	sendMessage(senderId, randomElementFromList(waitForBot));
	postVideoMethod('patoshi', text, replyTo)
		.then(() => sendMessage(senderId, `Uspeshno si patoshio @${targetUsername} swe u 16 ${randomElementFromList(randomEmojiSuccess)}`));
}

const fuxo = (senderId, targetUsername, text, replyTo) => {
	updateItemCount('daily-usage', senderId);
	sendMessage(senderId, randomElementFromList(waitForBot));         
	postVideoMethod('fuxo', text, replyTo)
		.then(() => sendMessage(senderId, `Uspeshno si fuxowao @${targetUsername} swe u 16 ${randomElementFromList(randomEmojiSuccess)}`));
}

const zejtin = (senderId, targetUsername, text, replyTo) => {
	updateItemCount('daily-usage', senderId);
	sendMessage(senderId, randomElementFromList(waitForBot));
	postVideoMethod('zejtin', text, replyTo)
		.then(() => sendMessage(senderId, `Uspeshno si zejtinowo @${targetUsername} swe u 16 ${randomElementFromList(randomEmojiSuccess)}`));
}

const mali = (senderId, targetUsername, text, replyTo) => {
	updateItemCount('daily-usage', senderId);
	sendMessage(senderId, randomElementFromList(waitForBot));
	postVideoMethod('mali', text, replyTo)
		.then(() => sendMessage(senderId, `Uspeshno si malowao @${targetUsername} swe u 16 ${randomElementFromList(randomEmojiSuccess)}`));
}

const sendHelp = (senderId) => {
	const msg = botHelp + `\n${randomElementFromList(randomEmojiSuccess)}${randomElementFromList(randomEmojiError)}`
	sendMessage(senderId, msg);
}

const sendInfo = (senderId, numOfCommandUses, maxOfCommandUses) => {
	sendMessage(senderId, 
		`~~ restart usluga je rano sabajle pre prwi petlowi(shestlowi xd) ~~\n\n` + 
		`Iskorishteno (${numOfCommandUses}/${maxOfCommandUses}) usluga za danas.\n\n` +
		'Za wishe informacija (ili predloga) jawi se malena na wacap +381 62 839 7553.\n\n(poshalji sise ako oces admina ' +
		`${randomElementFromList(randomEmojiSuccess)}${randomElementFromList(randomEmojiError)})\n\n` +
		`~made by: rip nokty xumor 😣`
	);
}

const whitelistAdd = (senderId, whitelist, targetUsername) => {
	getUserByUsername(targetUsername)
		.then((res) => {
			whitelist.push(res.id_str);
			DATABASE_ADMIN_ADD('Whitelist', { user_id: res.id_str, username: targetUsername });
			logTime(`@${targetUsername} (ID: ${res.id_str}) added to whitelist.`);
			sendMessage(senderId, `@${targetUsername} (ID: ${res.id_str}) added to whitelist.`);
		});
}

const blacklistAdd = (senderId, blacklist, targetUsername) => {
	getUserByUsername(targetUsername)
		.then((res) => {
			blacklist.push(res.id_str);
			DATABASE_ADMIN_ADD('Blacklist', { user_id: res.id_str, username: targetUsername });
			logTime(`@${targetUsername} (ID: ${res.id_str}) added to blacklist.`);
			sendMessage(senderId, `@${targetUsername} (ID: ${res.id_str}) added to blacklist.`);
	});
}

module.exports = {
	patoshi,
	fuxo,
	zejtin,
	mali,
	sendHelp,
	sendInfo,
	whitelistAdd,
	blacklistAdd
}