"use strict";

// Load required modules. 
var express = require('express'),
	path = require('path'),
	fs = require('fs'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
	config = require(__dirname + '/config.js'),
	AppError = require(__dirname + '/app_error.js');

// Start express. 
var app = express(); 

// Set up public directory for serving static resources. 
app.use(express.static(path.join(__dirname, '../public'), { maxAge: '28d' }));

// Parse supplied cookies and retrieve session data. 
app.use(cookieParser(config.cookieSecret));
app.use(session({secret:config.cookieSecret, saveUninitialized:false, resave:false})); 

// API routes. 
app.use('/api', require(__dirname + '/routes/login_route.js'));
app.use('/api', require(__dirname + '/routes/user_route.js'));
app.use('/api', require(__dirname + '/routes/inventory_route.js'));
app.use('/api', require(__dirname + '/routes/event_route.js'));
app.use('/api', require(__dirname + '/routes/item_route.js'));

// Homepage
app.route('*').get(function(req, res, next){
	res.send("It's working!");
});

// Handle any errors thrown earlier. 
app.use(function(err, req, res, next){
	if (err instanceof AppError) {
		res.status(err.statusCode).send(err.message); 
	}
	else {
		res.status(500).send("Internal server error"); 
	}
});

module.exports = app;  

