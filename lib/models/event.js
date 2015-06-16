'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	queryWriter = require(__dirname + '/query_writer.js'),
	Inventory = require(__dirname+'/inventory.js'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var Event = {};

Event.findById = function(id, callback){

	dbConn.query('SELECT * FROM events WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err); 
		return callback(null, results[0]);
	});
}; 

Event.belongsToUser = function(eventId, userId, callback){
	dbConn.query("SELECT * FROM users_events WHERE eventId='"+eventId+"' AND userId='"+userId+"'", function(err, results){
		if (err) return callback(err);
		var belongs = (results.length>0) ? true : false ; 
		return callback(null, belongs);
	});
};

// data is an object with name, startDate and endDate properties. 
Event.create = function(data, userId, callback){

	dbConn.beginTransaction(function(err){
		if (err) return callback(err);
		// First try to write new entry in events table.  
		var queryString1 = queryWriter.insert('events', data);
		dbConn.query(queryString1, function(err, result1){
			if (err) dbConn.rollback(function(){
				return next(err);
			});
			// If successful, next try to create an entry in users_events.  
			var queryString2 = queryWriter.insert('users_events', {userId:userId, eventId:result1.insertId});
			dbConn.query(queryString2, function(err, result2){
				if (err) dbConn.rollback(function(){
					return next(err);
				});
				// If successful, try to write new record in inventories table. 
				var queryString3 = queryWriter.insert('inventories', {name:'event'+result1.insertId}); 
				dbConn.query(queryString3, function(err,result3){
					if (err) dbConn.rollback(function(){
						return next(err);
					});
					// If successful, write inventory id into new event record. 
					var queryString4 = queryWriter.update('events', result1.insertId, {invId:result3.insertId}); 
					dbConn.query(queryString4, function(err,result4){
						if (err) dbConn.rollback(function(){
							return next(err);
						});
					});
					// If all queries are successful, commit the transaction. 
					dbConn.commit(function(err){
						if (err) dbConn.rollback(function(){
							return next(err);
						});
						// Return the id of the new event record. 
						return callback(null, result1.insertId);
					});
				});
			});
		});
	});
};

Event.update = function(id, data, callback){

	var queryString = queryWriter.update('events', id, data);
	dbConn.query(queryString, function(err){
		if (err) return callback(err);
		return callback(null);
	});
};

Event.delete = function(id, callback){

	// First get information on this event. 
	this.findById(id, function(err, event){
		if (err) callback(err); 
		// Get list of all items in event's inventory:
		Inventory.findItems(event.invId, function(err, items){
			if (err) return callback(err);
			// Convert into array of ids:
			var itemIds = [];
			items.forEach(function(item){
				itemIds.push(item.id);
			});
			// Remove all these items from the inventory. 
			Inventory.removeItems(id, itemIds, function(err){
				if (err) return callback(err);
				// Now delete records from inventories, events and users_events.  
				dbConn.query("DELETE FROM inventories WHERE id='"+event.invId+"'", function(err){
					if (err) callback(err);
					dbConn.query("DELETE FROM users_events WHERE eventId='"+id+"'", function(err){
						if(err) callback(err);
						dbConn.query("DELETE FROM events WHERE id='"+id+"'", function(err){
							if (err) callback(err); 
							callback();
						});
					});
				});
			});
		});
	});
};

// Merge in items from selected inventories when first creating event. 
// eventId is a number, the id of the event just created. 
// invIds is an array of numbers, corresponding to the ids of the inventories whose items are being merged in. 
// callback takes a single err parameter. 
Event.addItems = function(eventId, invIds, callback){

	// First get ids of items. 
	var orString = queryWriter.repeatedOr('invId', invIds);
	dbConn.query("SELECT DISTINCT itemId FROM inventories_items WHERE "+orString, function(err, items){
		if (err) return next(err); 
		// Convert from array of objects to array of integers. 
		var itemIds = [];
		items.forEach(function(item){
			itemIds.push(item.itemId);
		});
		// Next get id of event's inventory. 
		dbConn.query("SELECT invId FROM events WHERE id='"+eventId+"'", function(err, eventInv){
			if (err) return next(err); 
			var eventInvId = eventInv[0].invId; 
			console.log(eventInvId);
			// Finally, add items to the event's inventory. 
			var queryString = "INSERT INTO inventories_items (invId, itemId) VALUES ";
			itemIds.forEach(function(itemId){
				queryString += "('"+eventInvId+"','"+itemId+"'), "; 
			});
			queryString = queryString.slice(0, -2);
			dbConn.query(queryString, function(err){
				if (err) return next(err); 
				return callback(null);
			});
		});
	});
};

module.exports = Event;