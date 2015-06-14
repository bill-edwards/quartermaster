'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	validate = require(path.join(__dirname, '../utilities/validate.js')),
	Item = require(path.join(__dirname, '../models/item.js')),
	Inventory = require(path.join(__dirname, '../models/inventory.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

// Create new item. 
router.route('/item/new')

	.post(gatekeeper, bodyParser.json(), validate('item',['name','invId']), function(req, res, next){

		// Check whether this name is available. 
		Item.isNameTaken(req.body.name, req.session.userId, function(err, taken){
			if (err) return next(err);
			if (taken) return next(new AppError(400, 'name already in use'));
			
			// Ensure that the inventory to which this item is added belongs to the user. 
			Inventory.belongsToUser(req.body.invId, req.session.userId, function(err, belongs){
				if (err) return next(err);
				if (!belongs) return next(new AppError(400, 'no such inventory belongs to this user'));

				// Insert new item into DB. 
				Item.create({name:req.body.name}, req.body.invId, function(err, newId){
					if (err) return next(err);
					// Return new id to client. 
					res.json({id:newId});
				});
			});
		});
	});

// Update existing item. 
router.route('/item/:itemId')
	
	.put(gatekeeper, bodyParser.json(), validate('item',['status']), function(req, res, next){

		// Verify that item-id is numeric. 
		if (!(/^\d+$/.test(req.params.itemId))) return next (new AppError(404, 'id must be a number'));

		// Check whether item belongs to one of the user's inventories. 
		Item.belongsToUser(req.params.itemId, req.session.userId, function(err, belongs){
			if (err) return next(err); 
			if (!belongs) return next (new AppError(404, 'no such item belongs to this user'));
			
			// Extract data for update; must include status.  
			var data = {status: req.body.status};
			// And can include issue, if status = 2. 
			if (req.body.status==2 && 'issue' in req.body) data.issue = req.body.issue;
			else data.issue = ""; 
			// Insert data into DB.  
			Item.update(req.params.itemId, data, function(err){
				if (err) return next(err);
				res.json({});
			});
		});
	});

// Get list of items matching search criteria. 
router.route('/item')

	.get(gatekeeper, function(req, res, next){

		// Extract data from query string, validate. 
		if (!(/^[\w\.&\'\-,; \?\!()$"]{1,40}$/.test(req.query.search))) return next (new AppError(400, 'search'));
		
		// Make a call to Item.findByName(). 
		Item.findByName(req.query.search, req.session.userId, function(err, items){
			if (err) return next (err); 
			res.json(items);
		});

	});

module.exports = router;