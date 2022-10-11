const { ETwitterStreamEvent } = require('twitter-api-v2');
const { onDataFilterStream } = require('./streaming/streamingExport');
const { onNewMessage } = require('./webhook/webhookExport');
const { sendHelp } = require('./webhook/switchCommands');
const { AutohookInstance, BearerClient } = require('./initInstances');
const { logTime } = require('./serverMaintenance');
const { getWhitelist, getBlacklist } = require('./databases/sheetdb');

/*
*	async renewRules()
*	async deleteRule(ruleId)
*	async viewRules()
*	async openStreaming(dailyStorageInstance, timestamp)
*	async openWebhook(dailyStorageInstance, timestamp)
*/

const renewRules = async () => {
	let rule = ''
		+ '(onaj sto sam te jebo)OR'
		+ '(onaj sto sam te jeba)OR'

		+ '(onaj što sam te jebo)OR'
		+ '(onaj što sam te jeba)OR'

		+ '(onai sto sam te jebo)OR'
		+ '(onai sto sam te jeba)OR'

		+ '(onai što sam te jebo)OR'
		+ '(onai što sam te jeba)OR'

		+ '(onaj shto sam te jebo)OR'
		+ '(onaj shto sam te jeba)OR'

		+ '(onai shto sam te jebo)OR'
		+ '(onai shto sam te jeba)OR'

		+ '(онај што сам те јебо)OR'
		+ '(онај што сам те јеба)'
	try {
		await BearerClient.v2.updateStreamRules({ add: [{ value: rule, tag: 'main1' }] });
	} catch (e) {
		console.log('Error in ./dependencies/init/addRule');
		console.log(e);
	}
}

const deleteRule = async (ruleId) => {
	try {
		await BearerClient.v2.updateStreamRules({ delete: { ids: [ruleId] } });
	} catch (e) {
		console.log('Error in ./dependencies/init/deleteRule');
		console.log(e);
	}
}

const viewRules = async () => {
	try {
		const rules = await BearerClient.v2.streamRules();
		console.log(rules);
	} catch (e) {
		console.log('Error in ./dependencies/init/viewRules');
		console.log(e);
	}
}

const openStreaming = async () => {
	// For debugging
	// await renewRules();
	// await viewRules();
	const stream = BearerClient.v2.searchStream({
		autoConnect: false,
		expansions: ['entities.mentions.username', 'referenced_tweets.id'],
		'user.fields': ['username']
	});

	stream.on(ETwitterStreamEvent.Data, async (x) => {
		onDataFilterStream(x);
	});

	stream.on(ETwitterStreamEvent.Connected, () => logTime('Stream opened.'));
	stream.on(ETwitterStreamEvent.ConnectionLost, () => logTime('Connection lost.'));
	stream.on(ETwitterStreamEvent.Reconnected, () => logTime('Stream reconnected.'));

	await stream.connect({ 
		autoReconnect: true,
		autoReconnectRetries: Infinity
	}).catch((e) => {
		console.log('Error connecting.');
	});
}

const openWebhook = async (dailyStorageInstance) => {
	const webhook = AutohookInstance;

	// Removes existing webhooks
	await webhook.removeWebhooks();

	const whitelist = await getWhitelist();
	console.log('Whitelist loaded.');
	const blacklist = await getBlacklist();
	console.log('Blacklist loaded.');

	webhook.on('event', async (event) => {
		if(event.direct_message_events) {
			await onNewMessage(dailyStorageInstance, event, whitelist, blacklist);
		} else if(event.follow_events){
			const senderId = event.follow_events[0].source.id;
			sendHelp(senderId);
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