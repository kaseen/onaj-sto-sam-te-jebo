const { ETwitterStreamEvent } = require('twitter-api-v2');
const { onDataFilterStream } = require('./libs/streamingExport');
const { onNewMessage } = require('./libs/webhookExport');
const { AutohookInstance, BearerClient } = require('./Instances');

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
	try{
		await BearerClient.v2.updateStreamRules({ add: [{ value: rule, tag: 'main1' }] });
	}catch(e){
		console.log('Error in ./dependencies/init/addRule');
		console.log(e);
	}
}

const deleteRule = async (ruleId) => {
	try{
		await BearerClient.v2.updateStreamRules({ delete: { ids: [ruleId] } });
	}catch(e){
		console.log('Error in ./dependencies/init/deleteRule');
		console.log(e);
	}
}

const viewRules = async () => {
	try{
		const rules = await BearerClient.v2.streamRules();
		console.log(rules);
	}catch(e){
		console.log('Error in ./dependencies/init/viewRules');
		console.log(e);
	}
}

const openStreaming = async (dailyStorageInstance, timestamp) => {
	// For debugging
	// await renewRules();
	// await viewRules();
	const stream = BearerClient.v2.searchStream({ 
		autoConnect: false,
		expansions: ['entities.mentions.username', 'referenced_tweets.id'],
		'user.fields': ['username']
	});

	stream.on(ETwitterStreamEvent.Data, async (x) => {
		dailyStorageInstance.boolSaveStorage(timestamp);
		onDataFilterStream(x);
	});

	stream.on(ETwitterStreamEvent.Connected, () => console.log('\nStream opened.'));
	stream.on(ETwitterStreamEvent.ConnectionLost, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nConnectionLost');
		console.log("\---------------------------------------------------------");
	});

	//
	stream.on(ETwitterStreamEvent.ConnectionError, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nConnectionError');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.ConnectionClosed, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nConnectionClosed');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.ReconnectAttempt, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nReconnectAttempt');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.ConnectError, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nConnectError');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.Reconnected, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nReconnected');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.ReconnectError, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nReconnectError');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.ReconnectLimitExceeded, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nReconnectLimitExceeded');
		console.log("---------------------------------------------------------");
	});
	//stream.on(ETwitterStreamEvent.DataKeepAlive, () => console.log('DataKeepAlive'));
	stream.on(ETwitterStreamEvent.DataError, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nDataError');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.TweetParseError, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nTweetParseError');
		console.log("---------------------------------------------------------");
	});
	stream.on(ETwitterStreamEvent.Error, async (e) => {
		await stream.close();
		await new Promise(resolve => setTimeout(resolve, Number(30)*1000));

		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
		console.log(e);
		console.log('\nError');
		console.log("---------------------------------------------------------");
	});
	//

	await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity, keepAliveTimeoutMs: Infinity });
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