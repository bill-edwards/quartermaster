'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var User = {};

User.findById = function(id, callback){

	var user; 
	// Get user data. 
	dbConn.query('SELECT * FROM users WHERE id="'+id+'"', function(err, results){
		if (err) return callback(err); 
		// Add retrieved data to model. 
		for (var prop in results[0]){user[prop] = results[0][prop];}
		return callback(null, user);
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

	console.log(queryString);
	// Query database. 
	dbConn.query(queryString, function(err, results){
		if (err) return callback(err); 

		// Return json to client. 
		return callback(null, results);
	});
};

module.exports = User;  