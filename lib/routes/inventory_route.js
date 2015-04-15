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

		// Verify that inventory-id is numeric. 
		if (!(/^\d+$/.test(req.params.invId))) return next (new AppError(400, 'id must be a number'));

		// Ensure that inventory exists and belongs to user. 
		Inventory.belongsToUser(req.params.invId, req.session.userId, function(err, belongs){
			if (err) return next(err); 
			if (!belongs) return next (new AppError(404, 'no such inventory belongs to this user'));
			updateName();
		});

		// Edit inventory details (name).
		function updateName(){
			if ('name' in req.body){
				Inventory.isNameTaken(req.body.name, req.session.userId, function(err, taken){
					if (err) return next(err); 
					if (taken) return next(new AppError(400, 'inventory name already in use'));
					Inventory.update(req.params.invId, {name: req.body.name}, function(err){
						if (err) return next (err); 
						addItems(); 
					});
				});
			}
			else addItems();
		};

		// Add items to inventory. 
		function addItems(){
			if ('addedItems' in req.body && req.body.addedItems.length>0){
				// First filter out any items which don't belong to the user. 
				Item.belongToUserFilter(req.body.addedItems, req.session.userId, function(err, allowedItemIds){
					if (err) return next(err); 
					// Check that some items remain after filter, otherwise skip to next function.  
					if (allowedItemIds.length!=0){
						Inventory.addItems(req.params.invId, allowedItemIds, function(err){
							if (err) return next(err);
							removeItems();
						});
					} 
					else removeItems();
				});
			}
			else removeItems();
		};

		// Remove items from inventory. 
		function removeItems(){
			if ('removedItems' in req.body && req.body.removedItems.length>0){
				Inventory.removeItems(req.params.invId, req.body.removedItems, function(err){
					if (err) return next(err);
					res.json({});
				});
			}
			else res.json({});
		};

	})

	// Delete existing inventory and all dependent data. 
	.delete(gatekeeper, function(req, res, next){

		// Verify that inventory-id is numeric. 
		if (!(/^\d+$/.test(req.params.invId))) return next (new AppError(400, 'id must be a number'));

		// Ensure that inventory exists and belongs to user. 
		Inventory.belongsToUser(req.params.invId, req.session.userId, function(err, belongs){
			if (err) return next(err); 
			if (!belongs) return next (new AppError(404, 'no such inventory belongs to this user'));
			
			// Delete inventory and associated records from database. 
			Inventory.delete(req.params.invId, function(err){
				if (err) return next(err); 
				res.json({});
			});
		});
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

