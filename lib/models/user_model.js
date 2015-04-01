'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var User = function(){
	this.create = create;
};

User.findById = function(id, callback){

	// Get user data. 
	dbConn.query('SELECT * FROM users WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err); 
		// mysql returns an array, we want an object. 
		var user = results[0];

		// Get list of inventories. 
		dbConn.query('SELECT inventories.id, inventories.name FROM inventories, users_inventories WHERE users_inventories.userId="'+id+'" AND inventories.id=users_inventories.invId', function(err, inventories){
			if(err) return callback(err);
			user.inventories = inventories; 

			// Return json to client. 
			return callback(null, user);
		});
	});
}; 

User.find = function(searchField, searchValue, callback){

	// Get user data. 
	dbConn.query('SELECT * FROM users WHERE '+searchField+'="'+searchValue+'"', function(err, results){
		if (err) return callback(err); 
		// mysql returns an array, we want an object. 
		var user = results[0];
		// Return json to client. 
		return callback(null, user);
	});
};

module.exports = User;  