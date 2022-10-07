require('dotenv').config({ path: require('find-config')('.env') });
const { DATABASE_USAGE_ADD, DATABASE_USAGE_CLEAR, getDailyUsage } = require('./libs/sheetdb');
const fs = require('fs');

/*
*   fileStorage:                            antiSpam: 
*
*   constructor(filePath)                   constructor()
*   async replenishMap()                    getIdTimestamp(userId)
*   exportToFilePath()                      getWarning(userId)
*   boolSaveStorage(timestampInstance)      checkSpam(userId)
*   onExit()                                setWarning(userId)
*   incrementId(userId)                     getWarning(userId)
*   printMap()                              checkSpam(userId)
*   getId(userId)                           setWarning(userId)
*   getMap()
*   getFilePath()                           Other:
*   getMapSize()                            importFromFile(filepath)
*   clearFile()                             addToEndOfFile(filepath, text)    
*   clearMap()                              readBotInfoTxt(filePath)
*                                           logTime(text)
*   timestampStorage:                       randomElementFromList(list)
*   constructor(filePath)                   dateNow()
*   readTimestampFromFile()
*   writeDateNowToFile()
*   getTimestamp()
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

    constructor() {
        this._map;
    }

	// 1 call to database
    async replenishMap(){
        this._map = await getDailyUsage();

		// TODO REMOVE
		console.log(this._map);
    }

	// 2 calls to database
    async exportMapToDatabase(){
		await DATABASE_USAGE_CLEAR();
		const list = [];
		// [{ user_id: '', count: '' }]
        for (const [key, value] of this._map) {
			list.push({ user_id: key, count: value});
        }
		await DATABASE_USAGE_ADD(list);
    }

	getTimestamp(){
		return this._map.get('timestamp');
	}

	// NE TREBA ZA POCETAK			MOZDA ZA KASNIJE
    // Only write to .txt file in storage without clearing map
    /*async boolSaveStorage(){
		console.log("\n----------------------- 2HOURLY -------------------------\n");       // TODO: remove after deep test
		logTime('\nMap entries before saving to server:\n');                                // TODO: remove after deep test
		this.printMap();                                                                    // TODO: remove after deep test
		console.log();                                                                      // TODO: remove after deep test
		await this.exportMapToDatabase();
		logTime('[SERVER MAINTENANCE]: Storage successfully saved to database.');
		console.log("\n---------------------------------------------------------\n");       // TODO: remove after deep test

		this.checkTimestamp(timestampInstance);
    }*/

	/*checkTimestamp(timestampInstance){
		if(dateNow() > timestampInstance.getTimestamp() + timestampInstance._RESET_TIME){
			console.log("\n------------------------ UPDATE -------------------------\n");   // TODO: remove after deep test
			logTime('\nMap entries before reset:\n');                                       // TODO: remove after deep test
			this.printMap();                                                                // TODO: remove after deep test
			// Clear fileStorage map and clear ./dailyUsage.txt file
			this.clearFile();
			this.clearMap();
			// Write new timestamp to file
			timestampInstance.writeDateNowToFile();
			timestampInstance.readTimestampFromFile();
			logTime(`New filestamp: ${timestampInstance.getTimestamp()}`);                  // TODO: remove after deep test
			logTime('[SERVER MAINTENANCE]: Timestamp file updated.\n');
		}
	}*/

    // Save map to .txt file and exit
    async onExit(){
        logTime(`Saving to database..`);						// TODO: remove after deep test
        logTime('Map entries on exit:\n');						// TODO: remove after deep test
        this.printMap();										// TODO: remove after deep test
        console.log();											// TODO: remove after deep test
        await this.exportMapToDatabase();
        logTime('Database saved, exiting...\n');
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

    getMapSize(){
        return this._map.size;
    }

	// TODO na timestamp
    clearMap(){
        this._map.clear();
    }

};

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
};

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

const randomElementFromList = (list) => {
    const randInt = Math.floor(Math.random()*(list.length));
    return list[randInt];
}

const dateNow = () => {
    return Number(new Date().getTime());
}

module.exports = {
    fileStorage,
    antiSpam,
    readBotInfoTxt,
    importFromFile,
    addToEndOfFile,
    logTime,
    randomElementFromList,
    dateNow
}

