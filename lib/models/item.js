'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	queryWriter = require(__dirname + '/query_writer.js'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var Item = {};

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
