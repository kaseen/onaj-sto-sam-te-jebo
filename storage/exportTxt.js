const { fileStorage, timestampStorage, readBotInfoTxt, importFromFile } = require('../dependencies/serverMaintenance');

const dailyStorageInstance = new fileStorage('./storage/txt/dailyUsage.txt');
const timestamp = new timestampStorage('./storage/resetStorage.txt');

const botHelperInfo = readBotInfoTxt('./storage/txt/botInfo.txt');
const whitelist = importFromFile('./storage/txt/whitelist.txt');
const blacklist = importFromFile('./storage/txt/blacklist.txt');
const commands = importFromFile('./storage/txt/commands.txt');

module.exports = {
    dailyStorageInstance,
    timestamp,
    botHelperInfo,
    whitelist,
    blacklist,
    commands
}