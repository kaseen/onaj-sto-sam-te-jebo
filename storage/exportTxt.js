const { readBotInfoTxt, importFromFile } = require('../src/serverMaintenance');

const botInfo = readBotInfoTxt('./storage/txt/botInfo.txt');
const botHelp = readBotInfoTxt('./storage/txt/botHelp.txt');
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
    botInfo,
	botHelp,
	hAdminInfo,
    commands,
	randomEmojiSuccess,
	randomEmojiError,
	waitForBot
}