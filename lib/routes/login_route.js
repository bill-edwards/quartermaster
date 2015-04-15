'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	User = require(path.join(__dirname, '../models/user.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 


// Logging in... 
router.route('/login')
	
	.post(bodyParser.json(), function(req, res, next){

		// Determine whether user with this username exists. 
		User.findOne({username:req.body.username}, function(err, user){
			if (err) return next(err);

			// No user with this username. 
			if (!user) return next(new AppError(404, "Username/Password incorrect"));
			
			// Authenticate with supplied password. 
			User.authenticate(user, req.body.password, function(err){

				// Server error, locked-out, or incorrect password. 
				if (err) return next(err);

				// Password correct!
				// Set session data. 
				req.session.regenerate(function(){

					req.session.userId = user.id; 

					// Return data to client. 	
					res.json(User.dataForClient(user)); 
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
