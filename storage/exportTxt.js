const { fileStorage, timestampStorage, readBotInfoTxt, importFromFile } = require('../dependencies/serverMaintenance');

const dailyStorageInstance = new fileStorage('./storage/txt/dailyUsage.txt');
const timestamp = new timestampStorage('./storage/txt/timestamp.txt');

const botHelperInfo = readBotInfoTxt('./storage/txt/botInfo.txt');
const hAdminInfo = readBotInfoTxt('./storage/txt/hAdminInfo.txt');
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
	hAdminInfo,
    commands,
	randomEmojiSuccess,
	randomEmojiError,
	waitForBot
}