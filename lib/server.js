"use strict";

// Import express app. 
var app = require(__dirname + '/app.js'); 

// Set port. 
var port = process.env.PORT || 3000; 

// Start server. 
app.listen(port);
console.log("server running on port 3000");  