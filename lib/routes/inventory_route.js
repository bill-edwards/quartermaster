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
	.get(gatekeeper, function(req, res, next){

		// Verify that inventory-id is numeric. 
		if (!(/^\d+$/.test(req.params.invId))) return next (new AppError(400, 'id must be a number'));

		// First determine whether inventory exists and belongs to user. 
		Inventory.belongsToUser(req.params.invId, req.session.userId, function(err, belongs){
			if (err) return next(err); 
			if (!belongs) return next (new AppError(404, 'no such inventory belongs to this user'));
			// Look up inventory details. 
			Inventory.findById(req.params.invId, function(err, inventory){
				if (err) return next(err);
				// Attach details of user's inventories. 
				Inventory.findItems(inventory.id, function(err, items){
					if (err) return next (err);
					inventory.items = items; 
					res.json(inventory);
				});
			});
		});
	})

	// Edit inventory details and item list. 
	.put(gatekeeper, bodyParser.json(), function(req, res, next){

		// Edit inventory details (name).
		// Should check if new name is available. !!!!!!!!
		if ('name' in req.body){
			Inventory.update(req.params.invId, {name: req.body.name}, function(err){
				if (err) return next (err); 
				addItems(); 
			});
		}
		addItems();

		// Add items to inventory. 
		function addItems(){
			if ('addedItems' in req.body){
				Inventory.addItems(req.params.invId, req.body.addedItems, function(err){
					if (err) return next(err);
					removeItems();
				});
			}
			else removeItems();
		};

		// Remove items from inventory. 
		function removeItems(){
			if ('removedItems' in req.body){
				Inventory.removeItems(req.params.invId, req.body.removedItems, function(err){
					if (err) return next(err);
					newItems();
				});
			}
			else newItems();
		};
		
		// Create new items and add to inventory. 
		function newItems(){
			if ('newItems' in req.body){
				async.each(req.body.newItems, function(newItem, callback){
					Item.create(newItem, req.params.invId, function(err){
						if (err) callback(err);
						callback();
					});
				}, function(err){
					if (err) return next(err);
					res.json({});
				});
			}
			else res.json({});
		};
	});

// Create a new inventory. 
router.route('/inventory/new')

	.post(gatekeeper, bodyParser.json(), function(req, res, next){

		Inventory.isNameTaken(req.body.name, req.session.userId, function(err, taken){
			if (err) return next(err);
			if (taken) return next(new AppError(400, 'name already in use'));

			// Extract user-supplied data. 
			var data = req.body;

			// Save details to database. 
			Inventory.create(data, req.session.userId, function(err, newId){
				if (err) return next(err);

				// Return new id to client. 
				res.json({id:newId});
			});
		});
	});

module.exports = router; 

