require('dotenv').config({ path: require('find-config')('.env') });
const { DATABASE_USAGE_ADD, DATABASE_USAGE_CLEAR, getDailyUsage } = require('./libs/sheetdb');
const fs = require('fs');

/*
*   fileStorage:                            antiSpam: 
*
*   constructor()							constructor()
*   async replenishMap()					getIdTimestamp(userId)
*   async exportMapToDatabase()				getWarning(userId)
*   async checkTimestamp()					checkSpam(userId)
*   async onExit()							setWarning(userId)
*   incrementId(userId)						getWarning(userId)
*   printMap()								checkSpam(userId)
*   getId(userId)							setWarning(userId)
*   getMap()
*   getTimestamp()                           
*   getMapSize()                            
*   clearMap()                              
*                                 
*	Other:                                     
*                    
*	importFromFile(filepath)				readBotInfoTxt(filePath)
*	logTime(text)							randomElementFromList(list)
*	dateNow()
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
		this._RESET_TIME = 86400000;
    }

	// 1 call to database
    async replenishMap(){
        this._map = await getDailyUsage();
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

	// 2 calls to database
	async checkTimestamp(){
		if(dateNow() > this.getTimestamp() + this._RESET_TIME){
			// Clear local map and clear database
			this.clearMap();
			await DATABASE_USAGE_CLEAR();
			const newTimestamp = dateNow();
			// Add new timestamp to local map and database
			await DATABASE_USAGE_ADD({ user_id: 'timestamp', count: newTimestamp });
			this._map.set('timestamp', newTimestamp);
			logTime('[SERVER MAINTENANCE]: Timestamp database updated.');
		}
	}

    async onExit(){
        await this.exportMapToDatabase();
        logTime('Database saved, exiting...\n');
    }

	expectedResetTime(){
		const exReset = new Date(this.getTimestamp() + this._RESET_TIME);
		exReset.setTime(exReset.getTime() + 2 * 60 * 60 * 1000);
		return exReset;
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

	getTimestamp(){
		return this._map.get('timestamp');
	}

    getMapSize(){
        return this._map.size;
    }

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
    logTime,
    randomElementFromList,
    dateNow
}