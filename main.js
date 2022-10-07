// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ FUTURE PLANS

- EVENT uksrs, nova godina, bozic bata i tako to
- ukloni ngrok, svoj server napravi 


------ MAIN

- mozda on exit stream.close() ???
- getTimestamp !admin option
- pametnije da se cekira timestamp za reset usluga

- NGROK 8 sati proveri jel radi valja to (na 8 sati restartuj usluge zbog provere)

- !mali na sliku stavi audio
- new filestamp na exit radi?
- korisnik moze da drejnuje ceo api (proveri kolki je limit per 24h)
- Kad neko zaprati bota posalji mu Komande poruku

------ ALT

- rendom lista patoshi, postPatoshi, prenk
- ALT TEXT NA SLIKE ALSO RANDOM
- patoshi alt text
*/

require('dotenv').config({ path: require('find-config')('.env') });
const { dateNow, logTime } = require('./dependencies/serverMaintenance');
const { openWebhook, openStreaming} = require('./dependencies/init');
const { dailyStorageInstance } = require('./storage/exportTxt');

process.on('exit', async () => {
	console.log("\n------------------------- EXIT --------------------------\n");
	console.log("TEST ZA HEROKU EXIT");
});

process.on('beforeExit', async () => {
	console.log("\n------------------------- BEXIT --------------------------\n");
	console.log("TEST ZA HEROKU BEFORE EXIT");
});

const checkTime = async (n) => {
	// Check timestamp every (n) minutes
	setTimeout(async function () {
		await dailyStorageInstance.checkTimestamp();
		checkTime(n);
	}, n * 60 * 1000);
}

const main = async () => {
	try{
		console.log("\n------------------------ STARTED ------------------------\n");
		const expectedRestart = new Date(dateNow() + process.env.SERVER_RESTART * 60 * 60 * 1000);
		console.log(`Expected restart time: ${expectedRestart.today()} ${expectedRestart.timeNow()}`);

		// Check timestamp every n minutes
		checkTime(75);

		// Load DailyUsage database.
		await dailyStorageInstance.replenishMap();
		console.log('DailyUsage loaded.');

		// Turn off bot every SERVER_RESTART h (Ngrok server lives 8h)
		// Heroku restart crashed dynos by spawning new dynos once every ten minutes (and than exponentially)
		setTimeout(async () => {
			logTime('Ngrok time passed, restarting...');
			await dailyStorageInstance.onExit();
			process.exit(0);
		}, process.env.SERVER_RESTART * 60 * 60 * 1000);

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