'use strict';

angular.module('authSync',[])

	.factory('authSyncService', ['$http', '$location', '$rootScope', function($http, $location, $rootScope){
		
		var loggedIn = null; 

		function authStatus(callback){
			// First make call to back-end to get log-in state. 
			console.log('authSyncService.authStatus: about to make request to /api/user/me');
			$http.get('/api/user/me')
			.success(function(data){
				loggedIn = true;  
				console.log('authSyncService.authStatus: data back from server (logged-in); about to call callback');
				callback(); 
			})
			.error(function(err){
				loggedIn = false;  
				console.log('authSyncService.authStatus: data back from server (not logged-in); ready to redirect to /welcome');
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