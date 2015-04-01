'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	User = require(path.join(__dirname, '../models/user_model.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

router.route('/user/:userId')
	
	.get(gatekeeper, function(req, res, next){
		User.findById(req.params.userId, function(err, user){
			if (err) return next(err);
			// No user with this id. 
			if (!user) return next(new AppError(404, "No user with this id"));
			// User found, return data to client. 
			res.json(user);
		});
	});


module.exports = router; 
