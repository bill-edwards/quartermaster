'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	User = require(path.join(__dirname, '../models/user_model.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 


// Logging in... 
router.route('/login')
	
	.post(bodyParser.json(), function(req, res, next){
		
		User.find('username', req.body.username, function(err, user){
			if (err) return next(err);

			// No user with this username. 
			if (!user) return next(new AppError(404, "Username/Password incorrect"));

			// Return data to client. 
			user.authenticate(req.body.password, function(err){

				// Server error, locked-out, or incorrect password. 
				if (err) return next(err);

				// Password correct!
				// Set session data. 
				req.session.regenerate(function(){

					req.session.userId = user.id; 

					// Return data to client. 	
					res.json(user); 
				});
			});
		});
	});

// ... and logging out. 
router.route('/logout')

	.post(function(req, res, next){
		req.session.destroy(function(){
			res.json({}); 
		});
		// Currently seems like session cookie is not deleted, only data in store. Is this a problem? 
	});

module.exports = router; 
