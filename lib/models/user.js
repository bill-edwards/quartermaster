'use strict';

var path = require('path'),
	bcrypt = require('bcrypt'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var User = {};

User.findById = function(id, callback){

	// Get user data. 
	dbConn.query('SELECT * FROM users WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err);  
		return callback(null, results[0]);
	});
}; 

User.find = function(search, callback){

	// Build SQL query using supplied search data. 
	var queryString = "SELECT * FROM users WHERE ";
	var fields = Object.keys(search); 

	fields.forEach(function(field){
		queryString += field+"='"+search[field]+"' AND ";
	});
	// Remove the last 'AND' from the query string. 
	queryString = queryString.slice(0, -5);

	// Query database. 
	dbConn.query(queryString, function(err, results){
		if (err) return callback(err); 

		// Return json to client. 
		return callback(null, results);
	});
};

User.findInventories = function(id, callback){

	dbConn.query("SELECT inventories.* FROM inventories JOIN users_inventories ON users_inventories.invId = inventories.id WHERE users_inventories.userId='"+id+"'", function(err, results){
		if (err) return callback(err);
		return callback(null, results);
	});
};

User.create = function(data, callback){

	// Hash password. 
	bcrypt.hash(data.password, 10, function(err, hash){
		if (err) return next(err);
		data.password = hash; 

		// Build SQL query using supplied search data. 
		var fields = Object.keys(data); 
		var fieldString = '(';
		var valueString = '(';
		fields.forEach(function(field){
			fieldString += field+", ";
			valueString += "'"+data[field]+"', ";
		});
		// Remove the last commas and spaces, and close brackets. 
		fieldString = fieldString.slice(0, -2)+')';
		valueString = valueString.slice(0, -2)+')';

		// Query database. 
		dbConn.query("INSERT INTO users "+fieldString+" VALUES "+valueString, function(err, result){
			if (err) return callback(err); 
			// Return id of new record. 
			return callback(null, result.insertId);
		});
	});
};

// If we ever allow updating of user passwords, will have to include password hashing here. 
User.update = function(id, data, callback){

	var queryString = "UPDATE users SET ";
	var fields = Object.keys(data); 
	fields.forEach(function(field){
		queryString += field+"='"+data[field]+"', ";
	});
	// Remove the last comma from the query string. 
	queryString = queryString.slice(0, -2);
	queryString += " WHERE id='"+id+"'";

	dbConn.query(queryString, function(err){
		if (err) return callback(err);
		return callback(null);
	});

};

User.authenticate = function(user, clearPW, callback){

	var data={};

	// Check if user is currently locked out. 
	if (user.loginAttempts>4) {
		if (user.timeout>Date.now()) return callback(new AppError(401, "locked-out"));
		else data.loginAttempts = 0; // Still need to save this to the database. 
	}

	// Check if password is correct. 
	bcrypt.compare(clearPW, user.password, function(err, match){
		if (err) return callback(err); 

		// Incorrect password. 
		if (!match) {
			// Update throttle status. 
			data.loginAttempts++;  
			data.timeout = Date.now() + (1*60*1000); // 1 minutes from now. 
			User.update(user.id, data, function(err){
				if (err) return callback(err);
				return callback(new AppError(404, "Username/Password incorrect"));
			}); 
		}
		// Login details correct: 
		else {
			// Update throttle status.
			data.loginAttempts = 0; 
			User.update(user.id, data, function(err){
				if (err) return callback(err);
				callback(null, user);
			});
		}
	});
};


module.exports = User;  
