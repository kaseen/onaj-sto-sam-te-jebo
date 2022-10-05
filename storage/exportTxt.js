const { fileStorage, timestampStorage, readBotInfoTxt, importFromFile } = require('../dependencies/serverMaintenance');

const dailyStorageInstance = new fileStorage('./storage/txt/dailyUsage.txt');
const timestamp = new timestampStorage('./storage/txt/timestamp.txt');

const botHelperInfo = readBotInfoTxt('./storage/txt/botInfo.txt');
const whitelist = importFromFile('./storage/txt/whitelist.txt');
const blacklist = importFromFile('./storage/txt/blacklist.txt');
const commands = importFromFile('./storage/txt/commands.txt');

const randomEmojiSuccess = ['😌', '😊', '😚', '🥰', '🤡', '😇', '👏', '👍', '🤙'];
const randomEmojiError = ['🧐', '🫣', '🤡', '😤', '😟', '😴', '🥴', '😷', '🙀', '🥶', '🤕', '🤐'];

const waitForBot = [
    'Sachekaj sekundu lutko 💖', 
    'Saće ga rešimo..',
    'Evo stizhe 🥰',
    'Twoja zhelja je moja zapowest princezo 😘',
    'Swe za tebe lutko 💖',
    'Evo beby stizhe 😏',
    'Shaljem 💌...',
    'Ide odma šefe'
]

module.exports = {
    dailyStorageInstance,
    timestamp,
    botHelperInfo,
    whitelist,
    blacklist,
    commands,
	randomEmojiSuccess,
	randomEmojiError,
	waitForBot
}