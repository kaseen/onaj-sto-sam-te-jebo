require('dotenv').config({ path: require('find-config')('.env') });
const fs = require('fs');
const readline = require('readline');

/*
*   antiSpam:                       fileStorage:
*
*   constructor()                   constructor(filePath)
*   incrementId(userId)             async replenishMap()
*   getIdCount(userId)              exportToFilePath()
*   getIdTimestamp(userId)          incrementId(userId)
*   getWarning(userId)              printMap()
*   checkSpam(userId)               getId(userId)
*   setWarning(userId)              getMap() 
*                                   getFilePath()
*                                   getMapSize()
*   timestampStorage:               clearFile()
*                                   clearMap()
*   constructor(filePath)           
*   readTimestampFromFile()         Other:
*   writeDateNowToFile()            logTime(text)
*   getTimestamp()                  dateNow()                  
*/
   

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

class fileStorage {

    constructor(filePath) {
        this._map = new Map();
        this._filePath = filePath;
    }

    async replenishMap(){
        const inputStream = fs.createReadStream(this._filePath);

        const lineReader = readline.createInterface({
            input: inputStream,
            // ako nesto baguje komentuj ovo
            crlfDelay: Infinity
        });

        for await (const line of lineReader) {
            if(line === ''){
                continue;
            }
            const mapField = line.split(' ');
            this._map.set(
                mapField[0],
                Number(mapField[1])
            );
        }
    }

    exportToFilePath(){
        // Erase this._filePath
        fs.writeFileSync(this._filePath, '', {flag: 'w'});

        for (const [key, value] of this._map) {
            const tmp = `${key} ${value}\n`;
            fs.writeFileSync(this._filePath, tmp, {flag: 'a'});
        }
    }

    incrementId(userId){
        const currentValue = this._map.get(userId);
        if(typeof currentValue === 'undefined')
            this._map.set(userId, 1);
        else
            this._map.set(userId, currentValue+1);
    }

    printMap(){
        for (const [key, value] of this._map) {
            console.log(`\t${key}\t\t${value}`);
        }
    }

    getId(userId){
        return this._map.get(userId);
    }

    getMap(){
        return this._map;
    }

    getFilePath(){
        return this._filePath;
    }

    getMapSize(){
        return this._map.size;
    }

    clearFile(){
        fs.writeFileSync(this._filePath, '', {flag: 'w'});
    }

    clearMap(){
        this._map.clear();
    }

};

class timestampStorage {

    constructor(filePath) {
        this.SECONDS_20H = 72000000;    // 20 * 60 * 60 * 1000
        this._filePath = filePath;
        this._seconds = 0;
    }

    readTimestampFromFile(){
        const data = fs.readFileSync(this._filePath, {encoding:'utf8', flag:'r'});
        this._seconds = Number(data);
    }

    writeDateNowToFile(){
        const out = new Date().getTime().toString();
        fs.writeFileSync(this._filePath, out, {flag: 'w'});
    }

    getTimestamp(){
        return this._seconds;
    }
}

class antiSpam {

    constructor() {
        this.TIME_BLOCK = process.env.ANTI_SPAM_SECONDS * 1000;
        this._map = new Map();
    }

    getIdTimestamp(userId){
        const tmp = this._map.get(userId);
        if(typeof tmp === 'undefined')
            return 0;
        return this._map.get(userId).timestamp;
    }

    getWarning(userId){
        const tmp = this._map.get(userId);
        if(typeof tmp === 'undefined')
            return false;
        return this._map.get(userId).warning;
    }

    checkSpam(userId){
        if(this.getIdTimestamp(userId) + this.TIME_BLOCK < dateNow())
            this._map.delete(userId);

        const currentValue = this._map.get(userId);
        if(typeof currentValue === 'undefined'){
            this._map.set(userId, {timestamp: dateNow(), warning: false});
            return false;   // False - not a spam
        }
        else{
            this._map.set(userId, {timestamp: dateNow(), warning: currentValue.warning});
            return true;    // True - it is a spam
        }
    }

    setWarning(userId){
        this._map.get(userId).warning = true;
    }
}

const onExit = (dailyStorageInstance) => {
    logTime(`Saving ${dailyStorageInstance.getFilePath()}`);
	logTime('Map entries on exit:\n');
	dailyStorageInstance.printMap();
    console.log();
	dailyStorageInstance.exportToFilePath();
	logTime('File saved, exiting...\n');
}

const onUpdate = (dailyStorageInstance, timestamp) => {
    logTime('\nMap entries before reset:\n');
    dailyStorageInstance.printMap();
    // Clear fileStorage map and clear ./dailyUsage.txt file
    dailyStorageInstance.clearFile();
    dailyStorageInstance.clearMap();
    // Write new timestamp to file
    timestamp.writeDateNowToFile();
    logTime(`New filestamp: ${timestamp.getTimestamp()}`)
    logTime('Storage files updated.\n');
}

const importFromFile = (filepath) => {
    const lines = fs.readFileSync(filepath, {encoding:'utf8', flag:'r'})
        .split('\n')
        .filter(Boolean)
    ;
    return lines;
}

const addToEndOfFile = (filepath, text) => {
    fs.writeFileSync(filepath, '\n' + text, {flag: 'a'});
}

const readBotInfoTxt = (filePath) => {
    const text = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'});
    return text;
}

const logTime = (text) => {
    const currentTime = new Date();

    console.log('(' + currentTime.today() + ')(' + currentTime.timeNow() + ') ' + text);
}

const dateNow = () => {
    return Number(new Date().getTime());
}

module.exports = {
    fileStorage,
    timestampStorage,
    antiSpam,
    onExit,
    onUpdate,
    readBotInfoTxt,
    importFromFile,
    addToEndOfFile,
    logTime,
    dateNow
}

