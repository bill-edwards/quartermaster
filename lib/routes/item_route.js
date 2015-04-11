'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	gatekeeper = require(path.join(__dirname, '../utilities/gatekeeper.js')),
	Item = require(path.join(__dirname, '../models/item.js')),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var router = express.Router(); 

router.route('/item/:itemId')
	
	.put(gatekeeper, bodyParser.json(), function(req, res, next){

		// Verify that item-id is numeric. 
		if (!(/^\d+$/.test(req.params.itemId))) return next (new AppError(400, 'id must be a number'));

		// Check whether item belongs to one of the user's inventories. 
		Item.belongsToUser(req.params.itemId, req.session.userId, function(err, belongs){
			if (err) return next(err); 
			if (!belongs) return next (new AppError(404, 'no such item belongs to this user'));
			
			// Extract data for update; must include status.  
			var data = {status: req.body.status};
			// And can include issue, if status = 2. 
			if (req.body.status==2) data.issue = req.body.issue; 
			// Insert data into DB.  
			Item.update(req.params.itemId, data, function(err){
				if (err) return next(err);
				res.json({});
			});
		});
	});

module.exports = router;