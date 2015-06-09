'use strict';

var path = require('path'),
	bcrypt = require('bcrypt'),
	async = require('async'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	queryWriter = require(__dirname + '/query_writer.js'),
	config = require(path.join(__dirname, '../config.js')),
	Inventory = require(__dirname+'/inventory.js'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var User = {};

User.findById = function(id, callback){

	dbConn.query('SELECT * FROM users WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err);  
		return callback(null, results[0]);
	});
}; 

User.find = function(search, callback){

	var queryString = queryWriter.select('users', search);
	dbConn.query(queryString, function(err, results){
		if (err) return callback(err); 
		return callback(null, results);
	});
};

User.findOne = function(search, callback){

	this.find(search, function(err, results){
		if (err) return callback(err);
		return callback(null, results[0]);
	});
};

User.findInventories = function(id, callback){

	dbConn.query("SELECT inventories.* FROM inventories JOIN users_inventories ON users_inventories.invId = inventories.id WHERE users_inventories.userId='"+id+"'", function(err, results){
		if (err) return callback(err);
		return callback(null, results);
	});
};

User.findEvents = function(id, callback){

	// First find all events belonging to user. 
	dbConn.query("SELECT events.* FROM events JOIN users_events ON users_events.eventId = events.id WHERE users_events.userId='"+id+"' ORDER BY events.startDate", function(err, events){
		if (err) return callback(err);
		// Next, for each event, determine how many items have red and yellow status. 
		async.each(events, function(event, cb){
			Inventory.countAlerts(event.invId, function(err,alerts){
				if (err) cb(err);
				event.alerts = alerts; 
				cb();
			});
		}, function(err){
			return callback(null, events);
		});
	});
};

User.dataForClient = function(user){
	var userClone = JSON.parse(JSON.stringify(user)); // Clone the user object. 
	delete userClone.password; 
	delete userClone.loginAttempts;
	delete userClone.timeout; 
	return userClone;
};

User.create = function(data, callback){

	// Hash password. 
	bcrypt.hash(data.password, 10, function(err, hash){
		if (err) return next(err);
		data.password = hash; 

		// Query database. 
		var queryString = queryWriter.insert('users', data);
		dbConn.query(queryString, function(err, result){
			if (err) return callback(err);
			// Return id of new record. 
			return callback(null, result.insertId);
		});
	});
};

// If we ever allow updating of user passwords, will have to include password hashing here. 
User.update = function(id, data, callback){

	var queryString = queryWriter.update('users', id, data);
	dbConn.query(queryString, function(err){
		if (err) return callback(err);
		return callback(null);
	});

};

User.isUsernameTaken = function(username, callback){

	this.find({username:username}, function(err, results){
		if (err) return next(err);
		var taken = (results.length !=0) ? true : false; 
		return callback(null, taken); 
	});
};

// Authentication with throttle. 
User.authenticate = function(user, clearPW, callback){

	// Check if user is currently locked out. 
	if (user.loginAttempts>(config.allowedLoginAttempts - 1)) {
		if (user.timeout>Date.now()) return callback(new AppError(401, "locked-out"));
		else user.loginAttempts = 0; // Still need to save this to the database. 
	}

	// Check if password is correct. 
	bcrypt.compare(clearPW, user.password, function(err, match){
		if (err) return callback(err); 

		// Incorrect password. 
		if (!match) {
			// Update throttle status. 
			user.loginAttempts++;  
			user.timeout = Date.now() + (config.lockoutMinutes*60*1000); // lockout time in milliseconds. 
			User.update(user.id, {loginAttempts:user.loginAttempts, timeout:user.timeout}, function(err){
				if (err) return callback(err);
				return callback(new AppError(404, "Username/Password incorrect"));
			}); 
		}
		// Login details correct: 
		else {
			// Update throttle status.
			user.loginAttempts = 0; 
			User.update(user.id, {loginAttempts:user.loginAttempts}, function(err){
				if (err) return callback(err);
				callback(null, user);
			});
		}
	});
};


module.exports = User;  
