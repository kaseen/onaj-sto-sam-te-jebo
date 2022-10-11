const { DBAdminMenu } = require('../initInstances');

/*
*	async DATABASE_ADMIN_GET(sheet)
*	DATABASE_ADMIN_ADD(sheet, username)
*	DATABASE_ADMIN_DELETE_USERNAME(sheet, username)
*	async getWhitelist()
*	async getBlacklist()
*/

const DATABASE_GET_TIMESTAMP = async () => {
	try{
		const res = JSON.parse(await DBAdminMenu.read({ sheet: 'Timestamp'}));
		return res[0].value;
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_GET_TIMESTAMP');
		console.log(e);
	}
}

const DATABASE_SET_TIMESTAMP = (newTimestamp) => {
	try{
		DBAdminMenu.update('timestamp', 'unixseconds', { value: newTimestamp }, 'Timestamp');
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_SET_TIMESTAMP');
		console.log(e);
	}
}

const DATABASE_ADMIN_GET = async (sheet) => {
	// Read the whole sheet
	try{
		return DBAdminMenu.read({ sheet: sheet });
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_GET');
		console.log(e);
	}
}

const DATABASE_ADMIN_ADD = (sheet, username) => {
	// Add row(s) in sheet
	// { user_id: '', username: '' }
	try{
		DBAdminMenu.create(username, sheet);
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_ADD');
		console.log(e);
	}
}

const DATABASE_ADMIN_DELETE_USERNAME = (sheet, username) => {
	// Delete row(s) in sheet
	try{
		DBAdminMenu.delete('username', username, sheet);
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_DELETE_USERNAME');
		console.log(e);
	}
}

const getWhitelist = async () => {
	const list = [];
	JSON.parse(await DATABASE_ADMIN_GET('Whitelist')).forEach((item) => { list.push(item['user_id']) });
	return list;
}

const getBlacklist = async () => {
	const list = [];
	JSON.parse(await DATABASE_ADMIN_GET('Blacklist')).forEach((item) => { list.push(item['user_id']) });
	return list;
}


module.exports = {
	DATABASE_GET_TIMESTAMP,
	DATABASE_SET_TIMESTAMP,
	DATABASE_ADMIN_ADD,
	DATABASE_ADMIN_DELETE_USERNAME,
	getWhitelist,
	getBlacklist
}