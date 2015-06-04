'use strict';

var path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	queryWriter = require(__dirname + '/query_writer.js'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var Event = {};

Event.belongsToUser = function(eventId, userId, callback){
	dbConn.query("SELECT * FROM users_events WHERE eventId='"+eventId+"' AND userId='"+userId+"'", function(err, results){
		if (err) return callback(err);
		var belongs = (results.length>0) ? true : false ; 
		return callback(null, belongs);
	});
};

// data is an object with name, startDate and endDate properties. 
Event.create = function(data, userId, callback){

	dbConn.beginTransaction(function(err){
		if (err) return callback(err);
		// First try to write new entry in events table.  
		var queryString1 = queryWriter.insert('events', data);
		dbConn.query(queryString1, function(err, result1){
			if (err) dbConn.rollback(function(){
				return next(err);
			});
			// If successful, next try to create an entry in users_events.  
			var queryString2 = queryWriter.insert('users_events', {userId:userId, eventId:result1.insertId});
			dbConn.query(queryString2, function(err, result2){
				if (err) dbConn.rollback(function(){
					return next(err);
				});
				// If successful, try to write new record in inventories table. 
				var queryString3 = queryWriter.insert('inventories', {name:'event'+result1.insertId}); 
				dbConn.query(queryString3, function(err,result3){
					if (err) dbConn.rollback(function(){
						return next(err);
					});
					// If successful, write inventory id into new event record. 
					var queryString4 = queryWriter.update('events', result1.insertId, {invId:result3.insertId}); 
					dbConn.query(queryString4, function(err,result4){
						if (err) dbConn.rollback(function(){
							return next(err);
						});
					});
					// If all queries are successful, commit the transaction. 
					dbConn.commit(function(err){
						if (err) dbConn.rollback(function(){
							return next(err);
						});
						// Return the id of the new event record. 
						return callback(null, result1.insertId);
					});
				});
			});
		});
	});
};

module.exports = Event;