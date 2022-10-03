const { ETwitterStreamEvent } = require('twitter-api-v2');
const { onDataFilterStream } = require('./libs/streamingExport');
const { onNewMessage } = require('./libs/webhookExport');
const { AutohookInstance, TwitterClient } = require('./Instances');
const { trackList, trackListMAIN } = require('../storage/listTrack');

const openStreaming = async () => {
	const stream = await TwitterClient.v1.filterStream({ track: trackListMAIN })
	
	stream.autoReconnect = true;
	stream.autoReconnectRetries = Infinity;
	stream.keepAliveTimeoutMs = Infinity;

	stream.on(ETwitterStreamEvent.Data, (eventData) => onDataFilterStream(eventData));
	stream.on(ETwitterStreamEvent.ConnectionLost, async () => {
		console.log('Connection lost...');
		await stream.reconnect();
		console.log('Reconnected.');
	});

	console.log('\nStream opened.');
}

const openWebhook = async (dailyStorageInstance, timestamp) => {
	const webhook = AutohookInstance;
		
	// Removes existing webhooks
	await webhook.removeWebhooks();
	
	webhook.on('event', async (event) => {
		if (event.direct_message_events){
			await onNewMessage(dailyStorageInstance, timestamp, event);
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