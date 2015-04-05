'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	Inventory = require(path.join(__dirname, '../models/inventory.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

router.route('/inventory/:invId')
	
	.get(function(req, res, next){

		Inventory.findById(req.params.invId, function(err, inventory){
			if (err) return next(err);
			Inventory.findItems(inventory.id, function(err, items){
				if (err) return next (err);
				inventory.items = items; 
				res.json(inventory);
			});
		});
	});

router.route('/inventory/new')

	.post(gatekeeper, bodyParser.json(), function(req, res, next){

		// Extract user-supplied data. 
		var data = req.body;

		// Save details to database. 
		Inventory.create(data, req.session.userId, function(err, newId){
			if (err) return next(err);
			// Return new id to client. 
			res.json({id:newId});
		});
	});

module.exports = router; 

