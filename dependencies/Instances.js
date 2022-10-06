require('dotenv').config({ path: require('find-config')('.env') })
const { Autohook } = require('twitter-autohook');
const { TwitterApi } = require('twitter-api-v2');
const sheetdb = require('sheetdb-node');

// ApiKey (Consumer key), ApiKeySecret (Consumer secret)
const TwitterApiInit = new TwitterApi({
  appKey:           process.env.CONSUMER_KEY_V2,
  appSecret:        process.env.CONSUMER_KEY_V2_SECRET,
  accessToken:      process.env.TOKENV2,
  accessSecret:     process.env.TOKENV2_SECRET,
});

const AutohookInstance = new Autohook({
  token:                process.env.TOKENV2,
  token_secret:         process.env.TOKENV2_SECRET,
  consumer_key:         process.env.CONSUMER_KEY_V2,
  consumer_secret:      process.env.CONSUMER_KEY_V2_SECRET,
  ngrok_secret:         process.env.NGROK_SECRET,
  env: 'env',
  port: process.env.PORT || 8999
});

const BearerClient = new TwitterApi(process.env.BEARER_TOKEN);

const TwitterClient = TwitterApiInit.readWrite;

const config = {
	address: process.env.SHEETDB_ADDRESS
}

const SheetDB = sheetdb(config);

module.exports = {
  AutohookInstance,
  BearerClient,
  TwitterClient,
  SheetDB
}