require('dotenv').config({ path: require('find-config')('.env') });
const fs = require('fs');
const { recreateCountTable } = require('./databases/dynamodb');
const { DATABASE_GET_TIMESTAMP, DATABASE_SET_TIMESTAMP } = require('./databases/sheetdb');

/*
*	timestampClass:
*
*	constructor()
*	async checkTimestamp()
*	expectedResetTime()
*	async initTimestamp()
*	setTimestamp(newTime)
*	getTimestamp()
*
*	antiSpam:
*	constructor()
*	getIdTimestamp(userId)
*	getWarning(userId)
*	checkSpam(userId)
*	setWarning(userId)
*
*	Other:
*
*	importFromFile(filepath)
*	readBotInfoTxt(filePath)
*	logTime(text)
*	randomElementFromList(list)
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

class timestampClass {

    constructor() {
        this._timestamp;
		this._RESET_TIME = 86000000;
    }

	// 2 calls to sheetdb
	async checkTimestamp(){
		if(dateNow() > this.getTimestamp() + this._RESET_TIME){
			// Clear daily-usage database
			recreateCountTable('daily-usage');
			// Save new timestamp to sheetdb and locally
			const newTimestamp = dateNow();
			this.setTimestamp(newTimestamp);
			logTime('[SERVER MAINTENANCE]: Timestamp database updated.');
		}
	}

	expectedResetTime(){
		const exReset = new Date(this.getTimestamp() + this._RESET_TIME);
		// Move two hours ahead becouse of heroku
		exReset.setTime(exReset.getTime() + 2 * 60 * 60 * 1000);
		return exReset;
	}

	// 1 call to sheetdb
	async initTimestamp(){
		this._timestamp = Number(await DATABASE_GET_TIMESTAMP());
	}

	// 1 call to sheetdb
	setTimestamp(newTime){
		DATABASE_SET_TIMESTAMP(newTime);
	}

	getTimestamp(){
		return this._timestamp;
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
    timestampClass,
    antiSpam,
    readBotInfoTxt,
    importFromFile,
    logTime,
    randomElementFromList,
    dateNow
}