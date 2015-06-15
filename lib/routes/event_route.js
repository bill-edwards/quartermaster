'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	validate = require(path.join(__dirname, '../utilities/validate.js')),
	Event = require(path.join(__dirname, '../models/event.js')),
	Inventory = require(path.join(__dirname, '../models/inventory.js')),
	Item = require(path.join(__dirname, '../models/item.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

// Create a new event.
router.route('/event/new')

	.post(gatekeeper, bodyParser.json(), validate('event',['name','startDate','endDate']), function(req, res, next){

		// Extract user-supplied data. 
		var data = req.body;

		// Ensure startDate precedes endDate: 
		if (data.startDate > data.endDate) return next(new AppError(400, 'endDate precedes startDate'));

		// Deal with inventory id array separately. 
		if ('invIds' in data){
			var invIds = data.invIds; 
			delete data.invIds;
		}
		
		// Save details to database. 
		Event.create(data, req.session.userId, function(err, newId){
			if (err) return next(err);

			if (invIds){
				// First filter out any inventories that don't belong to the user. 
				Inventory.belongToUserFilter(invIds, req.session.userId, function(err, allowedInvIds){
					if (err) return next(err); 
					// Ensure some ids survived the filter. 
					if (allowedInvIds.length>0){
						// Add items to event's inventory: 
						Event.addItems(newId, allowedInvIds, function(err){
							if (err) return next(err); 
							res.json({id:newId});
						});
					}
					// else return new id to client. 
					else res.json({id:newId});
				});
			}
			// Return new id to client. 
			else res.json({id:newId});
		});
	});

router.route('/event/:eventId')
	
	// Get details and item list for event. 
	.get(gatekeeper, function(req, res, next){

		// Verify that event-id is numeric. 
		if (!(/^\d+$/.test(req.params.eventId))) return next (new AppError(404, 'id must be a number'));

		// First determine whether event exists and belongs to user. 
		Event.belongsToUser(req.params.eventId, req.session.userId, function(err, belongs){
			if (err) return next(err); 
			if (!belongs) return next (new AppError(404, 'no such event belongs to this user'));
			// Look up event details. 
			Event.findById(req.params.eventId, function(err, event){
				if (err) return next(err);
				// Attach details of event's inventory's items. 
				Inventory.findItems(event.invId, function(err, items){
					if (err) return next (err);
					event.inventory = {id:event.invId, items:items}; 
					res.json(event);
				});
			});
		});
	})

	// Edit event details and item list. 
	.put(gatekeeper, bodyParser.json(), validate('event',[]), function(req, res, next){

		// Store ids in local variables:
		var eventId = req.params.eventId; 
		var invId = null; // To be set shortly. Needs to be declared here in outer scope so accessible to all inner functions. 

		// Verify that event-id is numeric. 
		if (!(/^\d+$/.test(eventId))) return next (new AppError(404, 'id must be a number'));

		// Ensure that event exists and belongs to user. 
		Event.belongsToUser(eventId, req.session.userId, function(err, belongs){
			if (err) return next(err); 
			if (!belongs) return next (new AppError(404, 'no such event belongs to this user'));
			// Get id of event's inventory. 
			Event.findById(eventId, function(err, event){
				if (err) return next(err); 
				invId = event.invId; 
				updateDetails();
			});
		});

		// Edit event details (name, start- and end-dates).
		function updateDetails(){

			var updateData = {};
			if ('name' in req.body) updateData.name = req.body.name; 
			if ('startDate' in req.body) updateData.startDate = req.body.startDate; 
			if ('endDate' in req.body) updateData.endDate = req.body.endDate;

			// If at least one of these fields is supplied, use it to edit the event. 
			if (Object.keys(updateData).length!=0){
				Event.update(eventId, updateData, function(err){
					if (err) return next (err); 
					addItems(); 
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
						Inventory.addItems(invId, allowedItemIds, function(err){
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
				Inventory.removeItems(invId, req.body.removedItems, function(err){
					if (err) return next(err);
					res.json({});
				});
			}
			else res.json({});
		};

	});

module.exports = router; 