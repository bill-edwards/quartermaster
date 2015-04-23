'use strict';

angular.module('validate',[])

	.factory('validate', ['$http', '$location', '$rootScope', function($http, $location, $rootScope){
		
		// Define validation types, with regex and formatting function. 
		var validationTypes = {
			text : {
				regex : /^[\w\.&\'\-,; \?\!()$"]{1,40}$/,
				format : function(raw){
					return raw.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/, ' ');
				},
				errMessage : "Use only letters, digits and normal punctuation, and use no more than 40 characters."
			},
			username : {
				regex : /^[\w\.~\-]{1,40}$/,
				format : function(raw){
					return raw.replace(/^\s+/, '').replace(/\s+$/, ''); 
				},
				errMessage : "Username should be between 1 and 40 characters; use letters, numbers and underscore only."
			},
			password : {
				regex : /^\S{8,}$/,
				format : function(raw){
					return raw; 
				},
				errMessage : "Password must be at least 8 characters long, and contain no whitespace."
			}
		};

		// Define the fields (and their validation types) associated with each type of resource. 
		var models = {
			user : {
				username : validationTypes.username,
				password : validationTypes.password
			},
			inventory : {
				name : validationTypes.text
			},
			item : {
				name : validationTypes.text,
				issue : validationTypes.text
			}
		};

		// This is the function returned by the service. 
		// data should be an object containing the contents of each field in the form.
		// model should be one of the properties of the model object above: 'user', 'inventory' or 'item'.
		// toCheck should be an array of strings, giving the properties of the data object that need verification (all those where the client has leeway to choose the supplied data). 
		function validate(data, model, toCheck){

			var errors = {}; 
			var hasErrors = false; 
			var thisModel = models[model];

			toCheck.forEach(function(field){
				var formattedData = thisModel[field].format(data[field]);
				console.log(formattedData);
				if (!thisModel[field].regex.test(formattedData)) {
					errors[field] = thisModel[field].errMessage; 
					hasErrors = true; 
				}
			});

			if (hasErrors) return errors;
			else return null; 
		};

		return validate; 

	}]);