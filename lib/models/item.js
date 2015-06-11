'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	queryWriter = require(__dirname + '/query_writer.js'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var Item = {};

Item.findByName = function(partialName, userId, callback){
	// Check in activity inventories. 
	dbConn.query("SELECT DISTINCT items.* FROM users_inventories JOIN inventories_items USING (invId) JOIN items ON inventories_items.itemId=items.id WHERE items.name LIKE '%"+partialName+"%' AND userId='"+userId+"'", function(err, items1){
		if (err) return callback(err); 
		// Check in event inventories. 
		dbConn.query("SELECT DISTINCT items.* FROM events JOIN inventories_items USING (invId) JOIN users_events ON users_events.eventId=events.id JOIN items ON inventories_items.itemId=items.id WHERE items.name LIKE '%"+partialName+"%' AND userId='"+userId+"'", function(err, items2){
			//Eliminate double-counting from activity and event inventories. 
			items2.forEach(function(item2){
				var match = false; 
				for (var item1 in items1){
					if (item2.id == item1.id) {
						match = true; 
						break;
					} 
				}
				if (!match) items1.push(item2); 
			});
			// items1 should now contain all distinct items. 
			callback(null, items1); 
		});
	});
};

Item.belongsToUser = function(itemId, userId, callback){
	// First check in user's activity inventories. 
	dbConn.query("SELECT * FROM users_inventories JOIN inventories_items USING (invId) WHERE users_inventories.userId ='"+userId+"' AND inventories_items.itemId ='"+itemId+"'", function(err, results){
		if (err) return callback(err);
		var belongs = (results.length>0); 
		// If not found there, check in event inventories. 
		if (!belongs){
			dbConn.query("SELECT * FROM inventories_items JOIN events USING (invId) JOIN users_events ON users_events.eventId=events.id WHERE userId='"+userId+"' AND itemId='"+itemId+"'",function(err, results2){
				if (err) return callback(err); 
				belongs = (results2.length>0); 
				return callback(null, belongs); 
			});
		}
		else return callback(null, belongs);
	});
};

// Given an array of item-ids, filters out those which don't belong to the user. 
Item.belongToUserFilter = function(itemIds, userId, callback){

	// Construct array of ids of items belonging to user. 
	dbConn.query("SELECT itemId FROM users_inventories JOIN inventories_items USING (invId) WHERE users_inventories.userId ='"+userId+"'", function(err, items){
		if (err) return callback(err);

		// First turn from array of objects to array of integers. 
		var usersItemIds = [];
		items.forEach(function(item){
			usersItemIds.push(item.itemId);
		});

		// Now construct array from intersection of supplied ids and ids belonging to user. 
		var allowedItemIds = itemIds.filter(function(itemId){
			return (usersItemIds.indexOf(itemId)!=-1); 
		});

		callback(null, allowedItemIds); 
	});
};

Item.isNameTaken = function(name, userId, callback){

	dbConn.query("SELECT * FROM users_inventories JOIN inventories_items USING (invId) JOIN items ON inventories_items.itemId=items.id WHERE items.name='"+name+"' AND userId='"+userId+"'", function(err, results){
		if (err) return callback(err);
		var taken = (results.length>0) ? true : false ; 
		return callback(null, taken);
	});
};


Item.create = function(data, invId, callback){

	dbConn.beginTransaction(function(err){
		if (err) return callback(err);
		// First try to write new record in items table. 
		var queryString1 = queryWriter.insert('items', data);
		dbConn.query(queryString1, function(err, result1){
			if (err) dbConn.rollback(function(){
				return next(err);
			});
			// If successful, next try to write new record in inventories_items table. 
			var queryString2 = queryWriter.insert('inventories_items', {invId:invId, itemId:result1.insertId});
			dbConn.query(queryString2, function(err, result2){
				if (err) dbConn.rollback(function(){
					return next(err);
				});
				// If both queries are successful, commit the transaction. 
				dbConn.commit(function(err){
					if (err) dbConn.rollback(function(){
						return next(err);
					});
					// Return the id of the new item record. 
					return callback(null, result1.insertId);
				});
			});
		});
	});
};

Item.update = function(id, data, callback){

	var queryString = queryWriter.update('items', id, data);
	dbConn.query(queryString, function(err){
		if (err) return callback(err);
		return callback(null);
	});
};

module.exports = Item;
