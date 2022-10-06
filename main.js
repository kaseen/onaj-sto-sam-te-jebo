// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ FUTURE PLANS

- EVENT uksrs, nova godina, bozic bata i tako to
- ukloni ngrok, svoj server napravi 


------ MAIN


- mozda on exit stream.close() ???

- 24H reset onUpdate (IMPLEMENTIRAO TESTIRA SE)
- Svakih sat vremena save to storage (IMPLEMENTIRAO TESTIRA SE)
- ne radi stream gasi se (IMPLEMENTIRANO TESTIRA SE)

- rucno mora se uklanja whitelist blacklist

- testiraj heroku storage .txt fajl
- process.on exit print timestamp trenutni i kad ce da se ocekuje resetovanje storaga
- getTimestamp !admin option
- pametnije da se cekira timestamp za reset usluga

- NGROK 8 sati proveri jel radi valja to (na 8 sati restartuj usluge zbog provere)

- !mali na sliku stavi audio
- new filestamp na exit radi?
- korisnik moze da drejnuje ceo api (proveri kolki je limit per 24h)
- Kad neko zaprati bota posalji mu Komande poruku

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

const checkStorage = async (n) => {
	await setTimeout(function () {
		dailyStorageInstance.boolSaveStorage(timestamp);
		checkStorage(n);
	}, n * 60 * 60 * 1000);
}

const main = async () => {
	try{
		console.log("\n------------------------ STARTED ------------------------\n");
		const expectedRestart = new Date(dateNow() + process.env.SERVER_RESTART * 60 * 60 * 1000);
		console.log(`Expected restart time: ${expectedRestart.today()} ${expectedRestart.timeNow()}`);

		// Turn off bot every SERVER_RESTART h (Ngrok server lives 8h)
		// Heroku restart crashed dynos by spawning new dynos once every ten minutes (and than exponentially)
		setTimeout(function () {
			logTime('Ngrok time passed, restarting...');
			process.exit(0);
		}, process.env.SERVER_RESTART * 60 * 60 * 1000);

		// Check timestamp on startup
		dailyStorageInstance.checkTimestamp(timestamp);

		// Every 2 hours (STORAGE_SAVE) save map in memory to drive
		checkStorage(process.env.STORAGE_SAVE);

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