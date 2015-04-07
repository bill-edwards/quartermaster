'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	async = require('async'),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	Inventory = require(path.join(__dirname, '../models/inventory.js')),
	Item = require(path.join(__dirname, '../models/item.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

router.route('/inventory/:invId')
	
	// Get details and item list for inventory. 
	.get(function(req, res, next){

		Inventory.findById(req.params.invId, function(err, inventory){
			if (err) return next(err);
			Inventory.findItems(inventory.id, function(err, items){
				if (err) return next (err);
				inventory.items = items; 
				res.json(inventory);
			});
		});
	})

	// Edit inventory details and item list. 
	.put(gatekeeper, bodyParser.json(), function(req, res, next){

		// Edit inventory details (name).

		// Add items to inventory. 
		Inventory.addItems(req.params.invId, req.body.addedItems, function(err){
			if (err) return next(err);
			removeItems();
		});

		// Remove items from inventory. 
		function removeItems(){
			Inventory.removeItems(req.params.invId, req.body.removedItems, function(err){
				if (err) return next(err);
				newItems();
			});
		};
		
		// Create new items and add to inventory. 
		function newItems(){

			async.each(req.body.newItems, function(newItem, callback){
				Item.create(newItem, req.params.invId, function(err){
					if (err) callback(err);
					callback();
				});
			}, function(err){
				if (err) return next(err);
				res.json({});
			});
		};
	});

// Create a new inventory. 
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

