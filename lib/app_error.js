
// Custom error 'class'

"use strict"; 

function AppError(statusCode, message){
	this.statusCode = statusCode || 500; 
	this.message = message || "";
	Error.captureStackTrace(this, AppError); 
}

AppError.prototype = Object.create(Error.prototype);
AppError.prototype.name = "AppError"; 

module.exports = AppError; 