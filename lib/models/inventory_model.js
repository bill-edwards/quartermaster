'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var Inventory = function(){
	this.name = 'my inventory';
};

Inventory.findById = function(id, callback){

	// Get inventory data. 
	dbConn.query('SELECT * FROM inventories WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err); 
		// mysql returns an array, we want an object. 
		var inventory = results[0];

		// Get list of items. 
		dbConn.query('SELECT items.id, items.name, items.status, items.issue FROM items, inventories_items WHERE invId="'+id+'" AND items.id=inventories_items.itemId', function(err, items){
			inventory.items = items; 

			// Return json to client. 
			return callback(null, inventory);
		});
	});
}; 

module.exports = Inventory;  
