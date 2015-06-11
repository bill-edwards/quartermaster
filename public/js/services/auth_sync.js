'use strict';

angular.module('authSync',[])

	.factory('authSyncService', ['$http', '$location', '$rootScope', function($http, $location, $rootScope){
		
		var loggedIn = null; 

		function authStatus(callback){
			// First make call to back-end to get log-in state. 
			$http.get('/api/user/me')
			.success(function(data){
				loggedIn = true;  
				callback(); 
			})
			.error(function(err){
				loggedIn = false;  
				$location.path('/welcome');
			}); 
		}

		// We need a function to query the log-in state. We can't simply return the log-in state below, since that would hard-code the initial (null) value. 
		function isLoggedIn(){
			return loggedIn; 
		};

		return {
			isLoggedIn:isLoggedIn,
			authStatus:authStatus
		}; 

	}]);