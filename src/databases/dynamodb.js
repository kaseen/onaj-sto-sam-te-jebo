const { AWS, dynamoDB, dynamoDocClient } = require('../initInstances');

/*
*	async getUserCountById(table_name, user_id)
*	deleteItem(table_name, user_id)
*	updateItemCount(table_name, user_id)
*	createCountTable(table_name)
*	deleteTable(table_name)
*	recreateCountTable(table_name)
*/

const getUserCountById = async (table_name, user_id) => {
	const params = {
		TableName: table_name,
		Key: {
			'user_id': user_id
		}
	};
	// Convert marshall (AWS Response) to JSON
	try{
		const res = AWS.DynamoDB.Converter.marshall(await dynamoDocClient.get(params).promise());
		return Number(res.Item.M.count.N);
	}catch(e){
		// If not found return 0
		return 0;
	}
}

const deleteItem = (table_name, user_id) => {
	const params = {
		TableName: table_name,
		Key: {
			'user_id': user_id
		}
	}

	dynamoDocClient.delete(params, function(err){
		if(err){
			console.log('Error in ./src/DynamoDB/dynamo/deleteItem'); 
			console.log(err);
		}
	});
}

const updateItemCount = (table_name, user_id) => {
	const params = {
		TableName: table_name,
		Key: {
			'user_id': user_id
		},
		UpdateExpression: 'SET #key = if_not_exists(#key, :initial) + :num',
		ExpressionAttributeValues: {
			':initial': 0,
			':num': 1
		},
		ExpressionAttributeNames: {
			'#key': 'count'
		}
	}

	dynamoDocClient.update(params, function(err){
		if(err){
			console.log('Error in ./src/DynamoDB/dynamo/updateItemCount'); 
			console.log(err);
		}
	});
}

const createCountTable = (table_name) => {
	const paramsForWaiting = {
		TableName: table_name
	}

	const paramsForCreation = {
		TableName: table_name,
		KeySchema: [
			{
				AttributeName: 'user_id',
				KeyType: 'HASH'
			}
		],
		AttributeDefinitions: [
			{
				AttributeName: 'user_id',
				AttributeType: 'S'
			}
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 5,
			WriteCapacityUnits: 5
		}
	}

	dynamoDB.waitFor('tableNotExists', paramsForWaiting, function(err){
		if(err){
			console.log('Error in ./src/DynamoDB/dynamo/createCountTable/tableNotExits');
			console.log(err);
		}else{
			dynamoDB.createTable(paramsForCreation, function(err){
				if(err){
					console.log('Error in ./src/DynamoDB/dynamo/createCountTable/createTable');
					console.log(err);
				}else{
					console.log(`Creating new table ${table_name}...`);
					dynamoDB.waitFor('tableExists', paramsForWaiting, function(err){
						if(err){
							console.log('Error in ./src/DynamoDB/dynamo/createCountTable/tableExists');
							console.log(err);
						}else{
							console.log(`Table ${table_name} successfully created.`);
						}
					});	
				}
			});
		}
	});
}

const deleteTable = (table_name) => {
	const params = {
		TableName: table_name
	}
	dynamoDB.deleteTable(params, function(err){
		if(err){
			console.log('Erro in ./src/DynamoDB/dynamo/deleteTable');
			console.log(err);
		}else{
			console.log(`Deleting table ${table_name}...`);
		}
	});
}

const recreateCountTable = (table_name) => {
	deleteTable(table_name);
	createCountTable(table_name);
}

module.exports = {
	getUserCountById,
	deleteItem,
	updateItemCount,
	createCountTable,
	deleteTable,
	recreateCountTable
}