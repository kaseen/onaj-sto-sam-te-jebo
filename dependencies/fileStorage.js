const fs = require('fs');
const readline = require('readline');

// Zapravo se dodaje u objekat na dan, svi korisnici za jedan dan se pamete u memoriju
// pa cuvaju na .txt na pocetku dana a lista se praznimodule.exports = fileStorage;
// Lakse da se proverava

module.exports = class fileStorage {

    constructor(filePath) {
        this._map = new Map();
        this._filePath = filePath;
    }

    async replenishMap(){
        const inputStream = fs.createReadStream(this._filePath);

        const lineReader = readline.createInterface({
            input: inputStream,
            crlfDelay: Infinity
        });

        for await (const line of lineReader) {
            const mapField = line.split(' ');
            this._map.set(mapField[0], Number(mapField[1]));
        }
    }

    getUsername(username){
        return this._map.get(username);
    }

    getMap(){
        return this._map;
    }

    getMapSize(){
        return this._map.size;
    }

    clearMap(){
        this._map.clear();
    }

};


