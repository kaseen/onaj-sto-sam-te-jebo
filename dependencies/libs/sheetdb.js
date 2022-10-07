const { DBAdminMenu, DBDailyUsage } = require('../Instances');

/*
*	async DATABASE_ADMIN_GET(sheet)
*	DATABASE_ADMIN_ADD(sheet, username)
*	DATABASE_ADMIN_DELETE_USERNAME(sheet, username)
*	async DATABASE_USAGE_GET()
*	async DATABASE_USAGE_ADD(list)
*	async DATABASE_USAGE_CLEAR()
*	async getWhitelist()
*	async getBlacklist()
*/

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

const DATABASE_USAGE_GET = async () => {
	// Read the whole sheet
	try{
		return DBDailyUsage.read({ sheet: 'DailyUsage' });
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_GET');
		console.log(e);
	}
}

const DATABASE_USAGE_ADD = async (list) => {
	// Add row(s) in sheet
	// [{ user_id: '', count: '' }]
	try{
		await DBDailyUsage.create(list, 'DailyUsage');
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_ADD');
		console.log(e);
	}
}

const DATABASE_USAGE_CLEAR = async () => {
	try{
		await DBDailyUsage.delete('user_id', '*', 'DailyUsage');
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_CLEAR');
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

const getDailyUsage = async () => {
	const map = new Map();
	JSON.parse(await DATABASE_USAGE_GET()).forEach((item) => {
		map.set(item['user_id'], Number(item['count']));
	});
	return map;
}

module.exports = {
	DATABASE_ADMIN_ADD,
	DATABASE_ADMIN_DELETE_USERNAME,
	DATABASE_USAGE_ADD,
	DATABASE_USAGE_CLEAR,
	getWhitelist,
	getBlacklist,
	getDailyUsage
}