'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	queryWriter = require(__dirname + '/query_writer.js'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var Inventory = {};

Inventory.findById = function(id, callback){

	dbConn.query('SELECT * FROM inventories WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err); 
		return callback(null, results[0]);
	});
}; 

Inventory.findItems = function(id, callback){

	dbConn.query("SELECT items.* FROM items JOIN inventories_items ON inventories_items.itemId = items.id WHERE inventories_items.invId='"+id+"'", function(err, results){
		if (err) return callback(err);
		return callback(null, results);
	});

};

Inventory.create = function(data, userId, callback){

	dbConn.beginTransaction(function(err){
		if (err) return callback(err);
		// First try to write new record in inventories table. 
		var queryString1 = queryWriter.insert('inventories', data);
		dbConn.query(queryString1, function(err, result1){
			if (err) dbConn.rollback(function(){
				return next(err);
			});
			// If successful, next try to write new record in users_inventories table. 
			var queryString2 = queryWriter.insert('users_inventories', {userId:userId, invId:result1.insertId});
			dbConn.query(queryString2, function(err, result2){
				if (err) dbConn.rollback(function(){
					return next(err);
				});
				// If both queries are successful, commit the transaction. 
				dbConn.commit(function(err){
					if (err) dbConn.rollback(function(){
						return next(err);
					});
					// Return the id of the new inventory record. 
					return callback(null, result1.insertId);
				});
			});
		});
	});
};

Inventory.addItems = function(invId, itemIds, callback){

	// First, check that the supplied items are not already attached to the inventory. 
	dbConn.query("SELECT itemId FROM inventories_items WHERE invId='"+invId+"'", function(err, items){
		if (err) return callback(err);

		// First turn from array of objects to array of integers. 
		var existingItemIds = [];
		items.forEach(function(item){
			existingItemIds.push(item.itemId);
		});
		// Now write items which are not already attached to the inventory into a new array. 
		var newItemIds = [];
		itemIds.forEach(function(itemId){
			if (existingItemIds.indexOf(itemId)==-1) newItemIds.push(itemId);
		});

		// If there are no such items, exit. 
		if (newItemIds.length==0) return callback(null);

		// Otherwise insert corresponding records into inventories_items table. 
		var queryString = "INSERT INTO inventories_items (invId, itemId) VALUES ";
		newItemIds.forEach(function(itemId){
			queryString += "('"+invId+"','"+itemId+"'), "; 
		});
		queryString = queryString.slice(0, -2);
		dbConn.query(queryString, function(err){
			if (err) return callback(err);
			return callback(null);
		});
	});
};

Inventory.removeItems = function(invId, itemIds, callback){

	// First construct a query string which will be useful. 
	var orString = queryWriter.repeatedOr('itemId', itemIds);

	// Now delete any links between the items and this inventory. 
	dbConn.query("DELETE FROM inventories_items WHERE invId='"+invId+"' AND ("+orString+")", function(err){
		if (err) callback(err);

		// Now we see whether the removed items still appear in the inventories_items table. 
		dbConn.query("SELECT itemId, invId FROM inventories_items WHERE "+orString, function(err, results){
			if (err) callback(err);

			var itemsToDelete = [];
			itemIds.forEach(function(itemId){
				var remainingLinks = results.filter(function(result){
					return (result.itemId == itemId);
				});
				if (remainingLinks.length==0) itemsToDelete.push(itemId);
			});

			// Any items which no longer appear in inventories_items must be deleted from the items table. 
			if (itemsToDelete.length==0) return callback(null);
			var orString2 = queryWriter.repeatedOr('id', itemsToDelete);
			dbConn.query("DELETE FROM items WHERE "+orString2, function(err){
				if (err) return callback(err); 

				callback(null);
			});

		});
	});

};

module.exports = Inventory;