require('dotenv').config({ path: require('find-config')('.env') })
const { Autohook } = require('twitter-autohook');
const { TwitterApi } = require('twitter-api-v2');
const AWS = require('aws-sdk');
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

const configAdminMenu = { address: process.env.SHEETDB_ADMIN_MENU };
const configDailyUsage = { address: process.env.SHEETDB_DAILY_USAGE };

const DBAdminMenu = sheetdb(configAdminMenu);
const DBDailyUsage = sheetdb(configDailyUsage);


// ----- AWS -----
const awsConfig = {
	region: 'eu-west-3',
	endpoint: 'dynamodb.eu-west-3.amazonaws.com',
};

AWS.config.update(awsConfig);

const dynamoDB = new AWS.DynamoDB();
const dynamoDocClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  AutohookInstance,
  BearerClient,
  TwitterClient,
  dynamoDB,
  dynamoDocClient,
  DBAdminMenu,
  DBDailyUsage
}