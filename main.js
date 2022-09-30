// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ MAIN

- spam patoshi na jednu osobu MOZE BREAK (mozda i ne)
- proveri kako heroku worker-a pali gasi
- pre svaki exit gresku upisi u fajl i ugasi (VALJDA JE)
- u ponoc console.log datoteku sa logovima, obrisi i kreiraj praznu datoteku
- test try/catch
- Kad neko zaprati bota posalji mu Komande poruku
- Error: Status is a duplicate!!! (puno primera dodaj zbog random)


------ ALT
- datoteka TODO u kaseengithub uradi i obrisi
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
const { AutohookInstance, TwitterClient } = require('./dependencies/Instances');
const { trackList, trackListMAIN } = require('./storage/listTrack');
const { onDataFilterStream } = require('./dependencies/streamingExport');
const { onNewMessage } = require('./dependencies/webhookExport');
const { ETwitterStreamEvent } = require('twitter-api-v2');

const openStreaming = async () => {
	const stream = await TwitterClient.v1.filterStream({ track: trackListMAIN });
	stream.on(ETwitterStreamEvent.Data, (eventData) => onDataFilterStream(eventData));
}

const openWebhook = async (dailyStorageInstance) => {
	const webhook = AutohookInstance;
		
	// Removes existing webhooks
	await webhook.removeWebhooks();
	
	webhook.on('event', async (event) => {
		if (event.direct_message_events){
			await onNewMessage(dailyStorageInstance, event);
		}
	})
	
	// Starts a server and adds a new webhook
	await webhook.start();
		
	// Subscribes to your own user's activity
	await webhook.subscribe({
		oauth_token: process.env.TOKENV2,
		oauth_token_secret: process.env.TOKENV2_SECRET
	});  
}

const dailyStorageInstance = new fileStorage('./storage/dailyUsage.txt');
const timestamp = new timestampStorage('./storage/resetStorage.txt');

process.on('exit', () => {
	logTime(`Saving ${dailyStorageInstance.getFilePath()}`);
	dailyStorageInstance.exportToFilePath();
	logTime('File saved, exiting...');
});

const main = async () => {
	try{

		// TODO: ugasi bota namerno da bi se upalio
		/*setTimeout(function () {
			throw new Error('error!');
		}, 45* 1000)*/

		// If app stops working fill map again on start
		await dailyStorageInstance.replenishMap();
		await openWebhook(dailyStorageInstance);
		await openStreaming();
		console.log("\n--------------------- STARTED ---------------------\n");
	} catch (e) {
		// Display the error and quit
		console.log("Error in MAIN");
		console.error(e);
		process.exit(1);
	}
}

main();