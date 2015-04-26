"use strict";

// Load required modules. 
var mysql = require('mysql'),
	config = require(__dirname + '/config.js');

var connection = mysql.createConnection(config.db);

module.exports = connection; 