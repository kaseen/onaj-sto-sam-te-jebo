// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ EVENT

uksrs, nova godina, bozic bata i tako to

------ MAIN

- ne radi stream gasi se (IMPLEMENTIRANO TESTIRA SE)
- NGROK 8 sati proveri jel radi valja to (na 8 sati restartuj usluge zbog provere)
- spam protection (IMPLEMENTIRAO TESTIRA SE)
- info: Bot prazni buffer svakih 8 sati (downtime 10 min), vreme poslednjeg restarta je timestamp:
- izracunaj kad ce se shutdownuje NA POCETAK OBJAVI SLEDECI RESTART JE

- !mali dobro jebe ovaj mali ali na sliku stavi audio
- ako je napisao @ trimuj
- new filestamp na exit radi?
- korisnik moze da drejnuje ceo api (proveri kolki je limit per 24h)
- spam patoshi na jednu osobu MOZE BREAK (mozda i ne)
- test try/catch
- Kad neko zaprati bota posalji mu Komande poruku
- Error: Status is a duplicate!!! (puno primera dodaj zbog random) ILI POsle poruke generisi novi tekst


------ ALT
- !admin hardkodovan admin id
- TODO ENV SERVER RESTART TIME 12h;
- COMMENTS IN SOLIDITY STANDARD
- preminum lista ban lista (whitelist, blacklist)
- .env list of usernames ['jawisemalena', 'test6bot']
- rendom lista patoshi, postPatoshi, prenk
- ALT TEXT NA SLIKE ALSO RANDOM
- patoshi alt text
*/

require('dotenv').config({ path: require('find-config')('.env') });
const { fileStorage, timestampStorage, onExit, onUpdate, dateNow, readBotInfoTxt } = require('./dependencies/serverMaintenance');
const { openWebhook, openStreaming} = require('./dependencies/init');

const dailyStorageInstance = new fileStorage('./storage/dailyUsage.txt');
const timestamp = new timestampStorage('./storage/resetStorage.txt');
timestamp.readTimestampFromFile();

process.on('exit', () => {
	console.log("\n------------------------- EXIT --------------------------\n");
	onExit(dailyStorageInstance);
});

const main = async () => {
	try{
		console.log("\n------------------------ STARTED ------------------------\n");
		// Turn off bot every 12h (720min)
		// Heroku restart crashed dynos by spawning new dynos once every ten minutes.
		setTimeout(function () {
			console.log("\n------------------------ RESTART ------------------------\n");
			process.exit(1);
			//throw new Error('Shutdown error');
		}, 12 * 60 * 60 * 1000);

		// Check if 20h passed after last reset of dailyUsage 
		if(dateNow() > timestamp.getTimestamp() + timestamp.SECONDS_20H){
			console.log("\n------------------------ UPDATE -------------------------\n");
			onUpdate(dailyStorageInstance, timestamp);
		}

		// If app stops working fill map again on start
		await dailyStorageInstance.replenishMap();

		await openWebhook(dailyStorageInstance);
		await openStreaming();
		console.log("\n------------------------- LIVE --------------------------\n");
	} catch (e) {
		// Display the error and quit
		console.log('Error in MAIN');
		console.error(e);
		process.exit(1);
	}
}

main();