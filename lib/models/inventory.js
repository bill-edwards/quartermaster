'use strict';

var path = require('path'),
	assert = require('assert'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	queryWriter = require(__dirname + '/query_writer.js'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var Inventory = {};

Inventory.findById = function(id, callback){

	// Insist that numeric id is supplied. 
	// assert.equal(typeof id, 'number', 'id should be a number');

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

// Returns the numbers of items in the inventory with red and yellow status. 
Inventory.countAlerts = function(id, callback){

	dbConn.query("SELECT * FROM items JOIN inventories_items ON inventories_items.itemId = items.id WHERE inventories_items.invId='"+id+"' AND (items.status=1 OR items.status=2)", function(err, items){
		if (err) return callback(err);
		var numberRed = items.filter(function(item){
			return item.status==1;
		}).length;
		var numberYellow = items.filter(function(item){
			return item.status==2;
		}).length;
		return callback(null, {red:numberRed, yellow:numberYellow});
	});

};

Inventory.belongsToUser = function(invId, userId, callback){
	// First check user's activity inventories. 
	dbConn.query("SELECT * FROM users_inventories WHERE invId='"+invId+"' AND userId='"+userId+"'", function(err, results){
		if (err) return callback(err);
		var belongs = (results.length>0);
		// If not found there, check event inventories. 
		if (!belongs){
			dbConn.query("SELECT * FROM users_events JOIN events ON users_events.eventId=events.id WHERE events.invId='"+invId+"' AND userId='"+userId+"'", function(err, results2){
				if (err) return callback(err); 
				belongs = (results2.length>0);
				return callback(null, belongs);
			});
		} 
		else return callback(null, belongs);
	});
};

// Given an array of inventory-ids, filters out those which don't belong to the user. 
// Obviously could do this via async.filter(Inventory.belongsToUser) but this would make multiple calls to the DB, and this just makes one. 
// Arguably it's unnecessary to search event inventories, since this function is only called when creating new event. 
Inventory.belongToUserFilter = function(invIds, userId, callback){

	// Get all user's activity inventories. 
	dbConn.query("SELECT invId FROM users_inventories WHERE userId ='"+userId+"'", function(err, actInvs){
		if (err) return callback(err);
		// Get all user's event inventories. 
		dbConn.query("SELECT events.invId FROM users_events JOIN events ON users_events.eventId=events.id WHERE userId='"+userId+"'", function(err, eventInvs){
			if (err) return callback(err); 

			// Form array of all user's inventories.
			var invs = actInvs.concat(eventInvs);
			// Turn from array of objects to array of integers. 
			var usersInvIds = [];
			invs.forEach(function(inv){
				usersInvIds.push(inv.invId);
			});

			// Now construct array from intersection of supplied ids and ids belonging to user. 
			var allowedInvIds = invIds.filter(function(invId){
				return (usersInvIds.indexOf(invId)!=-1); 
			});

			callback(null, allowedInvIds); 
		});

	});
};

Inventory.isNameTaken = function(name, userId, callback){
	dbConn.query("SELECT * FROM users_inventories JOIN inventories ON users_inventories.invId=inventories.id WHERE inventories.name='"+name+"' AND userId='"+userId+"'", function(err, results){
		if (err) return callback(err);
		var taken = (results.length>0) ? true : false ; 
		return callback(null, taken);
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

Inventory.update = function(id, data, callback){

	var queryString = queryWriter.update('inventories', id, data);
	dbConn.query(queryString, function(err){
		if (err) return callback(err);
		return callback(null);
	});
};

Inventory.delete = function(id, callback){

	var Inventory = this; 
	// First query for all items in inventory: 
	this.findItems(id, function(err, items){
		if (err) return callback(err);
		// Convert into array of ids:
		var itemIds = [];
		items.forEach(function(item){
			itemIds.push(item.id);
		});
		// Now remove all these items from inventory:
		Inventory.removeItems(id, itemIds, function(err){
			if (err) return callback(err);
			// Now delete records from inventories and users_inventories.  
			dbConn.query("DELETE FROM inventories WHERE id='"+id+"'", function(err){
				if (err) callback(err);
				dbConn.query("DELETE FROM users_inventories WHERE invId='"+id+"'", function(err){
					if(err) callback(err);
					callback();
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