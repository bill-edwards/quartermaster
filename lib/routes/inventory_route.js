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

module.exports = router; 