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

		Item.update(req.params.itemId, req.body, function(err){
			if (err) return next(err);
			res.json({});
		});
	});

module.exports = router;