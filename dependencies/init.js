const { ETwitterStreamEvent } = require('twitter-api-v2');
const { onDataFilterStream } = require('./libs/streamingExport');
const { onNewMessage } = require('./libs/webhookExport');
const { AutohookInstance, TwitterClient } = require('./Instances');
const { trackList, trackListMAIN } = require('../storage/listTrack');

const openStreaming = async () => {
	const stream = await TwitterClient.v1.filterStream({ track: trackListMAIN });
	stream.on(ETwitterStreamEvent.Data, (eventData) => onDataFilterStream(eventData));

	stream.autoReconnect = true;

	// TODO MOZDA REMOVE
	//stream.close();
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

module.exports = {
    openStreaming,
    openWebhook
}