'use strict';

var path = require('path'),
	bcrypt = require('bcrypt'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
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