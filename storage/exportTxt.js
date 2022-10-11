const { timestampClass, readBotInfoTxt, importFromFile } = require('../dependencies/serverMaintenance');

const timestampInstance = new timestampClass();

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
    timestampInstance,
    botHelperInfo,
	hAdminInfo,
    commands,
	randomEmojiSuccess,
	randomEmojiError,
	waitForBot
}