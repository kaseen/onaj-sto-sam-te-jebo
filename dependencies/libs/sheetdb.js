const { SheetDB } = require('../Instances');

/*
*	async DATABASE_GET(sheet)
*	DATABASE_ADD(sheet, username)
*	DATABASE_DELETE_USERNAME(sheet, username)
*	async getWhitelist()
*	async getBlacklist()
*/

const DATABASE_GET = async (sheet) => {
	// Read the whole sheet
	try{
		return SheetDB.read({ sheet: sheet });
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_GET');
		console.log(e);
	}
}

const DATABASE_ADD = (sheet, username) => {
	// Add row(s) in sheet
	// { user_id: '', username: '' }
	try{
		SheetDB.create(username, sheet);
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_ADD');
		console.log(e);
	}
}

const DATABASE_DELETE_USERNAME = (sheet, username) => {
	// Delete row(s) in sheet
	try{
		SheetDB.delete('username', username, sheet);
	}catch(e){
		console.log('Error in ./dependencies/libs/sheetdb/DATABASE_DELETE_USERNAME');
		console.log(e);
	}
}

const getWhitelist = async () => {
	const list = [];
	JSON.parse(await DATABASE_GET('Whitelist')).forEach((item) => { list.push(item['user_id']) });
	return list;
}

const getBlacklist = async () => {
	const list = [];
	JSON.parse(await DATABASE_GET('Blacklist')).forEach((item) => { list.push(item['user_id']) });
	return list;
}

module.exports = {
	DATABASE_ADD,
	DATABASE_DELETE_USERNAME,
	getWhitelist,
	getBlacklist
}