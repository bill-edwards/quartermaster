'use strict';

angular.module('authSync',[])

	.factory('authSyncService', ['$http', '$location', '$rootScope', function($http, $location, $rootScope){
		
		var loggedIn = null; 

		// First make call to back-end to get log-in state. 
		console.log('authSyncService: beginning instantiation, about to make request to /api/user/me');
		$http.get('/api/user/me')
		.success(function(data){
			loggedIn = true;  
			console.log('authSyncService: data back from server (logged-in); ready to broadcast "initialise"');
			$rootScope.$broadcast('initialise');
			console.log('authSyncService: completed broadcast "initialise"');
		})
		.error(function(err){
			loggedIn = false;  
			console.log('authSyncService: data back from server (not logged-in); ready to broadcast "initialise"');
			$rootScope.$broadcast('initialise');
			//setTimeout(function(){$rootScope.$broadcast('initialise');},100);
			console.log('authSyncService: completed broadcast "initialise"');
			
		}); 

		// We need a function to query the log-in state. We can't simply return the log-in state below, since that would hard-code the initial (null) value. 
		function isLoggedIn(){
			return loggedIn; 
		};

		return {isLoggedIn:isLoggedIn}; 

	}]);