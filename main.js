// HTTP ERROR: 401 Unathorized - Check time on local pc

/*
*	Adding new video command steps:
*	1. Add video to ./vid
*	2. Add <name> to ./src/webhook/switchCommands
*	3. Add path to ./src/twitterapi/twitterLib/methodtoVideoMap
*	4. Add to ./storage/txt/ command name in botHelp.txt, botInfo.txt and commands.txt
*	5. Add to import and switch in ./src/webhook onNewMention and onNewMessage  
*/

/* TODOS:

------ FUTURE PLANS

- EVENT uksrs, nova godina, bozic bata i tako to
- ukloni ngrok, svoj server napravi 


------ MAIN

- korisnik moze da drejnuje ceo api (proveri kolki je limit per 24h)

- micy rekla da mogu komande da budu anonimne

------ ALT

- rendom lista patoshi, postPatoshi, prenk
- ALT TEXT NA SLIKE ALSO RANDOM
- patoshi alt text
*/

require('dotenv').config({ path: require('find-config')('.env') });
const cron = require('node-cron');
const { dateNow, logTime } = require('./src/serverMaintenance');
const { openWebhook, openStreaming } = require('./src/initMain');
const { recreateCountTable } = require('./src/databases/dynamodb')

// 2am je 4am u heroku
cron.schedule('0 2 * * *', () => {
	logTime('[SERVER MAINTENANCE]: Cron job...');
	recreateCountTable('daily-usage');
});

const main = async () => {
	try{
		console.log("\n------------------------ STARTED ------------------------\n");
		const expectedRestart = new Date(dateNow() + process.env.SERVER_RESTART * 60 * 60 * 1000);
		console.log(`Expected restart time: ${expectedRestart.today()} ${expectedRestart.timeNow()}`);

		// Turn off bot every SERVER_RESTART h (Ngrok server lives 8h)
		// Heroku restart crashed dynos by spawning new dynos once every ten minutes (and than exponentially)
		setTimeout(async () => {
			logTime('Ngrok time passed, restarting...');
			process.exit(0);
		}, process.env.SERVER_RESTART * 60 * 60 * 1000);

		await openWebhook();
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