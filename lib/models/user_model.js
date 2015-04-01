'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var User = function(){
	// Fields. 
	this.loginAttempts = 0;
	this.timeout = 0; 

	// Methods. 
	this.authenticate = authenticate; 
};

User.findById = function(id, callback){

	var user = new User();

	// Get user data. 
	dbConn.query('SELECT * FROM users WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err); 
		// Add retrieved data to model. 
		for (var prop in results[0]){user[prop] = results[0][prop];}

		// Get list of inventories. 
		dbConn.query('SELECT inventories.id, inventories.name FROM inventories, users_inventories WHERE users_inventories.userId="'+id+'" AND inventories.id=users_inventories.invId', function(err, inventories){
			if(err) return callback(err);
			// Add retrieved data to model. 
			user.inventories = inventories; 

			// Return json to client. 
			return callback(null, user);
		});
	});
}; 

User.find = function(searchField, searchValue, callback){

	var user = new User();

	// Get user data. 
	dbConn.query('SELECT * FROM users WHERE '+searchField+'="'+searchValue+'"', function(err, results){
		if (err) return callback(err); 
		// Add retrieved data to model. 
		for (var prop in results[0]){user[prop] = results[0][prop];}
			
		// Return json to client. 
		return callback(null, user);
	});
};

// User authentication with throttle. 
function throttledAuth(clearPW, callback){

	var user = this; 

	// Check if user is currently locked out. 
	if (user.loginAttempts>4) {
		if (user.timeout>Date.now()) return callback(new AppError(401, "locked-out"));
		else user.loginAttempts = 0; // Still need to save this to the database. 
	}

	// Check if password is correct. 
	this.authenticate(clearPW, function(err, match){
		if (err) return callback(err); 

		// Incorrect password. 
		if (!match) {
			// Update throttle status. 
			user.loginAttempts++;  
			user.timeout = Date.now() + (1*60*1000); // 1 minutes from now. 
			user.update(function(err){
				if (err) return callback(err);
				return callback(new AppError(404, "Username/Password incorrect"));
			}); 
		}
		// Login details correct: 
		else {
			// Update throttle status.
			user.loginAttempts = 0; 
			user.update(function(err){
				if (err) return callback(err);
				callback(null, user);
			});
		}
	});
}

function authenticate(clearPW, callback){
	callback(null);
}

module.exports = User;  