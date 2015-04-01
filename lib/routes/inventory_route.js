'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	Inventory = require(path.join(__dirname, '../models/inventory_model.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

router.route('/inventory/:invId')
	
	.get(function(req, res, next){
		Inventory.findById(req.params.invId, function(err, inventory){
			if (err) return next(err);
			res.json(inventory);
		});
	});

router.route('/inventory/new')

	.post(bodyParser.json(), function(req, res, next){

		// Extract user-supplied data. 
		var inventory = new Inventory();
		inventory.name = req.body.name;
		inventory.user = '1'; // This needs to be changed. 

		// Save details to database. 
		inventory.create(function(err){
			if (err) return next(err);
			// Return data (most importantly new id) to client. 
			res.json(inventory);
		});
	});

module.exports = router; 

