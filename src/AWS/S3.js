const { AWS_S3, TwitterClient } = require('../initInstances');
const { logTime } = require('../serverMaintenance');

/*
*	async loadFilenameFromAWSIntoBuffer(filename)
*	async getDirectoryLength(directory)
*	async postRandomDailyVideo(directory)
*/

const loadFilenameFromAWSIntoBuffer = async (filename) => {
	const downloadParams = {
		Bucket: 'onaj-sto-sam-te-jebo',
		Key: filename
	};
	try{
		const res = AWS_S3.getObject(downloadParams).promise();
		return (await res).Body;
	}catch(err){
		console.log('Error in src/AWS/S3/loadFilenameFromAWSIntoBuffer');
		console.log(err);
	}
}

const getDirectoryLength = async (directory) => {
	const params = {
		Bucket: 'onaj-sto-sam-te-jebo',
		Prefix: directory + '/',
		Delimiter: '/'
	};
	try{
		const res = AWS_S3.listObjects(params).promise();
		return (await res).Contents.length;
	}catch(err){
		console.log('Error in src/AWS/S3/getDirectoryLength');
		console.log(err);
	}
}

const postRandomDailyVideo = async (directory) => {
	try{
		const len = await getDirectoryLength(directory) - 1;
		const rand = Math.floor(Math.random()*(len)) + 1;

		if(rand === 0)
			throw Error('Unknown video');

		const filename = directory + '/' + directory + rand + '.mp4';

		const file = await loadFilenameFromAWSIntoBuffer(filename);
		const mediaId = await TwitterClient.v1.uploadMedia(file, { mimeType: 'video/mp4' });
		TwitterClient.v1.tweet('', { media_ids: mediaId });

		logTime('[DAILY VIDEO]: ' + directory + '(' + rand + ')');
	} catch(err){
		console.log('Error in src/AWS/S3/postRandomDailyVideo');
		console.log(err);
	}
}

module.exports = {
	getDirectoryLength,
	postRandomDailyVideo
}