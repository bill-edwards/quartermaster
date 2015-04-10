'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	User = require(path.join(__dirname, '../models/user.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 


router.route('/user/me')
	
	.get(gatekeeper, function(req, res, next){
		User.findById(req.session.userId, function(err, user){
			if (err) return next(err);
			// Get user's inventories. 
			User.findInventories(user.id, function(err, inventories){
				user.inventories = inventories; 
				// Return data to client. 
				res.json(user);
			}); 
		});
	});

router.route('/user/new')

	.post(bodyParser.json(), function(req, res, next){

		// First check whether username is available. 
		User.isUsernameTaken(req.body.username, function(err, taken){
			if (err) return next(err); 
			if (taken) return next(new AppError(400, 'username already in use'));

			// Extract user-supplied data. 
			var data = req.body;
			data.loginAttempts = 0;
			data.timeout = 0; 

			// Save details to database. 
			User.create(data, function(err, newId){
				if (err) return next (err);
				// Set session data. 
				req.session.regenerate(function(){

					req.session.userId = newId; 

					// Return data to client. 	
					res.json(newId); 
				});
			});
		});
	});


module.exports = router; 
