// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ EVENT

uksrs, nova godina, bozic bata i tako to

------ MAIN

- testiraj heroku storage .txt fajl
- process.on exit print timestamp trenutni i kad ce da se ocekuje resetovanje storaga
- !neca 2 (testcase nije proper) (CHECK SAMO PRVU REC ISPOD Check valid commands)
- getTimestamp !admin option
- blacklist.txt whitelist.txt (!black !white username komande only admin) (I REMOVE from white and black)


- SIGTERM NODEJS
- ne radi stream gasi se (IMPLEMENTIRANO TESTIRA SE)
- spam protection (IMPLEMENTIRAO TESTIRA SE)
- NGROK 8 sati proveri jel radi valja to (na 8 sati restartuj usluge zbog provere)
- !info iskoristeno (2/5) POSLEDNJI RESTART, OCEKIVANI SLEDECI info: Bot prazni buffer svakih 8 sati (downtime 10 min), vreme poslednjeg restarta je timestamp i sledeceg

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
const { fileStorage, timestampStorage, onExit, onUpdate, dateNow } = require('./dependencies/serverMaintenance');
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
		const expectedRestart = new Date(dateNow() + process.env.SERVER_RESTART * 60 * 60 * 1000);
		console.log(`Expected restart time: ${expectedRestart.today()} ${expectedRestart.timeNow()}\n`);

		// Turn off bot every 12h (720min)
		// Heroku restart crashed dynos by spawning new dynos once every ten minutes.
		setTimeout(function () {
			console.log("\n------------------------ RESTART ------------------------\n");
			process.exit(0);
			//throw new Error('Shutdown error');
		}, process.env.SERVER_RESTART * 60 * 60 * 1000);

		// Check if 20h passed after last reset of dailyUsage 
		if(dateNow() > timestamp.getTimestamp() + timestamp.SECONDS_20H){
			console.log("\n------------------------ UPDATE -------------------------\n");
			onUpdate(dailyStorageInstance, timestamp);
		}

		// If app stops working fill map again on start
		await dailyStorageInstance.replenishMap();

		await openWebhook(dailyStorageInstance, timestamp);
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

//const {getUserByUsername} = require('./dependencies/libs/twitterLib')
//const { importFromFile, addToEndOfFile } = require('./dependencies/serverMaintenance');

async function bla(){
	/*const x = importFromFile('./storage/txt/whitelist.txt');
	console.log(x);
	addToEndOfFile('./storage/txt/whitelist.txt', 'linijajaaa');
	const x1 = importFromFile('./storage/txt/whitelist.txt');
	console.log(x1);*/
	/*const x = await getUserByUsername('ka1seen');
	console.log(x.id_str);*/
	const commands = importFromFile('./storage/txt/commands.txt');
	console.log(commands);
	const unos = '!bla'
	console.log(!commands.includes(unos));
	return;
}

//bla();