const fs = require('fs');
const readline = require('readline');

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

const logTime = (text) => {
    const currentTime = new Date();

    console.log('(' + currentTime.today() + ')(' + currentTime.timeNow() + '): ' + text);
}

module.exports = {
    fileStorage,
    logTime
}

