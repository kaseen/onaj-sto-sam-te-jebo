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
        //console.log();
        for (const [key, value] of this._map) {
            console.log(`\t${key}\t\t${value}`);
        }
        //console.log();
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
        this._filePath = filePath;
        this.SECONDS_20H = 72000000;
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
    logTime,
    dateNow
}

