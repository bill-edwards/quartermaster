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

User.create = function(data, callback){

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
};



module.exports = User;  
