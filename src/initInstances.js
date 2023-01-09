require('dotenv').config({ path: require('find-config')('.env') })
const { Autohook } = require('twitter-autohook');
const { TwitterApi } = require('twitter-api-v2');
const AWS = require('aws-sdk');
const DYNAMO_DB = require('aws-sdk/clients/dynamodb');
const S3 = require('aws-sdk/clients/s3');
const sheetdb = require('sheetdb-node');

// CONSUMER_KEY = Project & Apps -> App -> Keys and tokens -> API Key and Secret
// TOKENV2 = Project & Apps -> App -> Keys and tokens -> Access Token and Secret
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

// BEARER_TOKEN = Project & Apps -> App -> Keys and tokens -> Bearer Token
const BearerClient = new TwitterApi(process.env.BEARER_TOKEN);
const TwitterClient = TwitterApiInit.readWrite;

// ----- SheetDB -----
const configAdminMenu = { address: process.env.SHEETDB_ADMIN_MENU };
const DBAdminMenu = sheetdb(configAdminMenu);

// ------- AWS -------
const AWS_S3 = new S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: 'eu-central-1',
	endpoint: 's3.eu-central-1.amazonaws.com'
})

const AWS_DYNAMO_DB = new DYNAMO_DB({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: 'eu-west-3',
	endpoint: 'dynamodb.eu-west-3.amazonaws.com',
});

// Needed for DocumentClient
AWS.config.update({ region: 'eu-west-3', endpoint: 'dynamodb.eu-west-3.amazonaws.com' });

const dynamoDocClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  AutohookInstance,
  BearerClient,
  TwitterClient,
  AWS,
  AWS_S3,
  AWS_DYNAMO_DB,
  dynamoDocClient,
  DBAdminMenu
}