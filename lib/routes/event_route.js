'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	validate = require(path.join(__dirname, '../utilities/validate.js')),
	Event = require(path.join(__dirname, '../models/event.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

// Create a new inventory. 
router.route('/event/new')

	.post(gatekeeper, bodyParser.json(), function(req, res, next){

		// Extract user-supplied data. 
		var data = req.body;

		// Save details to database. 
		Event.create(data, req.session.userId, function(err, newId){
			if (err) return next(err);

			// Return new id to client. 
			res.json({id:newId});
		});
	});

module.exports = router; 