require('dotenv').config({ path: require('find-config')('.env') })
const { Autohook } = require('twitter-autohook');
const { TwitterApi } = require('twitter-api-v2');

// ApiKey (Consumer key), ApiKeySecret (Consumer secret)
const TwitterApiInit = new TwitterApi({
  appKey:           process.env.CONSUMER_KEY,
  appSecret:        process.env.CONSUMER_KEY_SECRET,
  accessToken:      process.env.ACCESS_TOKEN,
  accessSecret:     process.env.ACCESS_TOKEN_SECRET,
});

const AutohookInstance = new Autohook({
  token:                process.env.TOKENV2,
  token_secret:         process.env.TOKENV2_SECRET,
  consumer_key:         process.env.CONSUMER_KEY_V2,
  consumer_secret:      process.env.CONSUMER_KEY_V2_SECRET,
  ngrok_secret:         process.env.NGROK_SECRET,
  env: 'env',
  port: 8999
});

const TwitterClient = TwitterApiInit.readWrite;

module.exports = {
  AutohookInstance,
  TwitterClient
}