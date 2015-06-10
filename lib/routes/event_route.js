'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	validate = require(path.join(__dirname, '../utilities/validate.js')),
	Event = require(path.join(__dirname, '../models/event.js')),
	Inventory = require(path.join(__dirname, '../models/inventory.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

// Create a new event.
router.route('/event/new')

	.post(gatekeeper, bodyParser.json(), function(req, res, next){

		// Extract user-supplied data. 
		var data = req.body;

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
						console.log(allowedInvIds); //////////////////////////////////////
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
	});

module.exports = router; 