require('dotenv').config({ path: require('find-config')('.env') });
const fs = require('fs');
const readline = require('readline');

/*
*   fileStorage:                    timestampStorage:
*
*   constructor(filePath)           constructor(filePath)
*   async replenishMap()            readTimestampFromFile()
*   exportToFilePath()              writeDateNowToFile()
*   incrementId(userId)             getTimestamp()
*   printMap()
*   getId(userId)
*   getMap()                        Other:
*   getFilePath()                   
*   getMapSize()                    logTime(text)
*   clearFile()                     dateNow
*   clearMap()
*/

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

    constructor(filePath) {;
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
        this.TIME_BLOCK = 7*1000;
        this._map = new Map();
    }

    incrementId(userId){
        const currentValue = this._map.get(userId);
        if(typeof currentValue === 'undefined')
            this._map.set(userId, {count: 1, timestamp: dateNow(), warning: false});
        else
            this._map.set(userId, {count: currentValue.count + 1, timestamp: currentValue.timestamp, warning: false});
    }

    getIdCount(userId){
        const tmp = this._map.get(userId);
        if(typeof tmp === 'undefined')
            return 0;
        return this._map.get(userId).count;
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

        if(this.getIdCount(userId) > process.env.ANTI_SPAM_MSG_COUNT)
            return true;
        else
            return false;
    }

    setWarning(userId){
        this._map.get(userId).warning = true;
    }
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
    logTime,
    dateNow
}

