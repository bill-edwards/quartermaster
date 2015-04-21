// Validator

"use strict"; 

var path = require('path'),
	AppError = require(path.join(__dirname, '../app_error.js')); 

var validator = function(model, required){

	// Define validation types, with regex and formatting function. 
	var validationTypes = {
		text : {
			array : false,
			regex : /^[\w\.&\'\-,; \?\!()$"]{1,40}$/,
			format : function(raw){
				return raw.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/, ' ');
			}
		},
		username : {
			array : false,
			regex : /^[\w\.~\-]{1,40}$/,
			format : function(raw){
				return raw.replace(/^\s+/, '').replace(/\s+$/, ''); 
			}
		},
		password : {
			array : false,
			regex : /^\S{8,}$/,
			format : function(raw){
				return raw; 
			}
		},
		status : {
			array : false,
			regex : /^\d$/,
			format : function(raw){
				return raw; 
			}
		},
		idArray : {
			array : true,
			regex : /^\d+$/,
			format : function(raw){
				return raw; 
			}
		},
		date : {
			array : false,
			regex : /^\d+/,
			format : function(raw){
				return raw; 
			}
		}
	};

	// Define the fields (and their validation types) associated with each type of resource. 
	var models = {
		user : {
			username : validationTypes.username,
			password : validationTypes.password
		},
		inventory : {
			name : validationTypes.text,
			addedItems : validationTypes.idArray,
			removedItems : validationTypes.idArray
		},
		item : {
			name : validationTypes.text,
			status : validationTypes.status,
			issue : validationTypes.text
		}
	};

	// The middleware function. 
	return function(req, res, next){

		var thisModel = models[model];

		var errorMessage = "";

		// Ensure that all required fields have been supplied. 
		required.forEach(function(requiredField){
			if (!req.body.hasOwnProperty(requiredField)) errorMessage += (requiredField + " ");
		});

		// Loop through POSTed data. 
		for (var data in req.body){
			if (req.body.hasOwnProperty(data)){

				// Delete any non-allowed POSTed fields from req.body. 
				if (!thisModel.hasOwnProperty(data)){
					delete req.body[data]; 
					continue; 
				}

				// Deal with array data (i.e. addedItems and removedItems)
				if (thisModel[data].array){
					// First ensure that supplied data is an array. 
					if (!Array.isArray(req.body[data])){
						errorMessage += (data + " ");
						continue;
					}
					req.body[data].forEach(function(element){
						// Format data if necessary. 
						element = thisModel[data].format(element);
						// Check against regex. 
						if (!thisModel[data].regex.test(element)) errorMessage += (data + " ");
					});
				}

				// Deal with singleton data. 
				else {
					// Format data if necessary. 
					req.body[data] = thisModel[data].format(req.body[data]); 
					// Check against regex. 
					if(!thisModel[data].regex.test(req.body[data])) errorMessage += (data + " ");
				}
			}
		}

		if (errorMessage) next(new AppError(400, errorMessage));
		else next(); 
	};
};

module.exports = validator;

