const fs = require('fs');
const readline = require('readline');

module.exports = class fileStorage {

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
        const outputStream = fs.createWriteStream(this._filePath, {
            flags: 'w'
        });

        for (const [key, value] of this._map) {
            outputStream.write(key + ' ' + value + '\n');
        }
    }

    getId(userId){
        return this._map.get(userId);
    }

    getMap(){
        return this._map;
    }

    getMapSize(){
        return this._map.size;
    }

    incrementId(userId){
        const currentValue = this._map.get(userId);
        if(typeof currentValue === 'undefined')
            this._map.set(userId, 1);
        else
            this._map.set(userId, currentValue+1);
    }

    clearMap(){
        this._map.clear();
    }

};


