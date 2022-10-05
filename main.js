// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ EVENT

uksrs, nova godina, bozic bata i tako to

------ MAIN

- mozda on exit stream.close() ???

- 24H reset onUpdate (IMPLEMENTIRAO TESTIRA SE)
- Svakih sat vremena save to storage (IMPLEMENTIRAO TESTIRA SE)

- testiraj heroku storage .txt fajl
- process.on exit print timestamp trenutni i kad ce da se ocekuje resetovanje storaga
- getTimestamp !admin option

- ne radi stream gasi se (IMPLEMENTIRANO TESTIRA SE)
- NGROK 8 sati proveri jel radi valja to (na 8 sati restartuj usluge zbog provere)

- !mali na sliku stavi audio
- ako je napisao @ trimuj
- new filestamp na exit radi?
- korisnik moze da drejnuje ceo api (proveri kolki je limit per 24h)
- spam patoshi na jednu osobu MOZE BREAK (mozda i ne)
- test try/catch
- Kad neko zaprati bota posalji mu Komande poruku
- Error: Status is a duplicate!!! (puno primera dodaj zbog random) ILI POsle poruke generisi novi tekst
- rucno mora se uklanja whitelist blacklist

------ ALT
- COMMENTS IN SOLIDITY STANDARD
- rendom lista patoshi, postPatoshi, prenk
- ALT TEXT NA SLIKE ALSO RANDOM
- patoshi alt text
*/

require('dotenv').config({ path: require('find-config')('.env') });
const { dateNow, logTime } = require('./dependencies/serverMaintenance');
const { openWebhook, openStreaming} = require('./dependencies/init');
const { dailyStorageInstance, timestamp } = require('./storage/exportTxt');

timestamp.readTimestampFromFile();

process.on('exit', () => {
	console.log("\n------------------------- EXIT --------------------------\n");
	dailyStorageInstance.onExit();
});

const checkEveryNHours = async (n) => {
	await setTimeout(function () {
		dailyStorageInstance.boolSaveStorage(timestamp);
		checkEveryNHours(n);
	}, n * 60 * 60 * 1000);
}

const main = async () => {
	try{
		console.log("\n------------------------ STARTED ------------------------\n");
		const expectedRestart = new Date(dateNow() + 8 * 60 * 60 * 1000);
		console.log(`Expected restart time: ${expectedRestart.today()} ${expectedRestart.timeNow()}`);

		// Turn off bot every HOURS_SERVER_RESTART h (Ngrok server lives 8h)
		// Heroku restart crashed dynos by spawning new dynos once every ten minutes (and than exponentially)
		setTimeout(function () {
			logTime('Ngrok time passed, restarting...');
			process.exit(0);
		}, 8 * 60 * 60 * 1000);

		// Check timestamp on startup
		dailyStorageInstance.checkTimestamp(timestamp);

		// Every 2 hours (HOURS_STORAGE_SAVE) save map in memory to drive
		checkEveryNHours(process.env.HOURS_STORAGE_SAVE);

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