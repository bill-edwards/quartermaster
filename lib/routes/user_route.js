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

		// Extract user-supplied data. 
		var data = req.body;
		data.loginAttempts = 0;
		data.timeout = 0; 

		// Save details to database. 
		User.create(data, function(err, newId){
			if (err) return next (err);
			res.json(newId);
		});
	});

router.route('/user/:userId')
	
	.get(gatekeeper, function(req, res, next){
		User.findById(req.params.userId, function(err, user){
			if (err) return next(err);
			// No user with this id. 
			if (!user) return next(new AppError(404, "No user with this id"));
			// User found, get user's inventories. 
			User.findInventories(user.id, function(err, inventories){
				user.inventories = inventories; 
				// Return data to client. 
				res.json(user);
			}); 
		});
	});


module.exports = router; 
