// HTTP ERROR: 401 Unathorized - Check time on local pc

/* TODOS:

------ MAIN
- spam patoshi na jednu osobu MOZE BREAK
- proveri kako heroku worker-a pali gasi
- pre svaki exit gresku upisi u fajl i ugasi
- KAD PROGRAM NAIDJE NA GRESKU I KRENE DA SE GASI UPISI MAPU U FAJL I PROCESS EXIT
- datoteka TODO u kaseengithub uradi i obrisi
- targetUsername nije blokiro bota PROVERA
- u ponoc console.log datoteku sa logovima, obrisi i kreiraj praznu datoteku
- preminum lista ban lista (whitelist, blacklist)
- COMMENTS IN SOLIDITY STANDARD
- test try/catch
- patoshi alt text
- Kad neko zaprati bota posalji mu Komande poruku
- Error: Status is a duplicate!!! (puno primera dodaj zbog random)


------ ALT
- .env list of usernames ['jawisemalena', 'test6bot']
- rendom lista patoshi, postPatoshi, prenk
- ALT TEXT NA SLIKE ALSO RANDOM
*/

require('dotenv').config({ path: require('find-config')('.env') });
const { AutohookInstance, TwitterClient } = require('./dependencies/Instances');
const { trackList, trackListMAIN } = require('./storage/listTrack');
const { onDataFilterStream } = require('./dependencies/streamingExport');
const { onNewMessage } = require('./dependencies/webhookExport');
const { ETwitterStreamEvent } = require('twitter-api-v2');
const fileStorage = require('./dependencies/fileStorage');

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

const main = async () => {
	try{
		const dailyStorageInstance = new fileStorage('./storage/dailyUsage.txt');
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