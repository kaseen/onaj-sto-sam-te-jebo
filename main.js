// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ EVENT

uksrs, nova godina, bozic bata i tako to

------ MAIN

- izracunaj kad ce se shutdownuje
- korisnik moze da drejnuje ceo api (proveri kolki je limit per 24h)
- spam patoshi na jednu osobu MOZE BREAK (mozda i ne)
- test try/catch
- Kad neko zaprati bota posalji mu Komande poruku
- Error: Status is a duplicate!!! (puno primera dodaj zbog random) ILI POsle poruke generisi novi tekst


------ ALT
- COMMENTS IN SOLIDITY STANDARD
- preminum lista ban lista (whitelist, blacklist)
- .env list of usernames ['jawisemalena', 'test6bot']
- rendom lista patoshi, postPatoshi, prenk
- fix NaN/3
- ALT TEXT NA SLIKE ALSO RANDOM
- patoshi alt text
*/

require('dotenv').config({ path: require('find-config')('.env') });
const { fileStorage, timestampStorage, logTime, dateNow } = require('./dependencies/serverMaintenance');
const { openWebhook, openStreaming} = require('./dependencies/init');

process.on('exit', () => {
	logTime(`Saving ${dailyStorageInstance.getFilePath()}`);
	logTime('\nMap entries on exit:');
	dailyStorageInstance.printMap();
	dailyStorageInstance.exportToFilePath();
	logTime('File saved, exiting...');
});

const dailyStorageInstance = new fileStorage('./storage/dailyUsage.txt');
const timestamp = new timestampStorage('./storage/resetStorage.txt');
timestamp.readTimestampFromFile();

const main = async () => {
	try{
		console.log("\n------------------------ STARTED ------------------------\n");
		// Turn off bot every 12h (720min)
		// Heroku restart crashed dynos by spawning new dynos once every ten minutes.
		setTimeout(function () {
			throw new Error('Shutdown error');
		}, 12 * 60 * 60 * 1000)

		// Check if 20h passed after last reset of dailyUsage 
		if(dateNow() > timestamp.getTimestamp() + timestamp.SECONDS_20H){
			logTime('\nMap entries before reset:');
			dailyStorageInstance.printMap();
			dailyStorageInstance.clearFile();
			dailyStorageInstance.clearMap();
			timestamp.writeDateNowToFile();
			logTime(`New filestamp: ${timestamp.getTimestamp()}`)
			logTime('Storage files updated');
		}

		// If app stops working fill map again on start
		await dailyStorageInstance.replenishMap();

		await openWebhook(dailyStorageInstance);
		await openStreaming();
		console.log("\n------------------------ LIVE ------------------------n");
	} catch (e) {
		// Display the error and quit
		console.log("Error in MAIN");
		console.error(e);
		process.exit(1);
	}
}

main();