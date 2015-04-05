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

module.exports = Inventory;