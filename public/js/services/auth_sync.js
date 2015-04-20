'use strict';

angular.module('authSync',[])

	.factory('authSyncService', ['$http', '$location', '$rootScope', function($http, $location, $rootScope){
		
		var loggedIn = null; 

		// First make call to back-end to get log-in state. 
		$http.get('/api/user/me')
		.success(function(data){
			loggedIn = true;  
			$rootScope.$broadcast('initialise');
			console.log('service initialised');
		})
		.error(function(err){
			loggedIn = false;  
			$rootScope.$broadcast('initialise');
			//setTimeout(function(){$rootScope.$broadcast('initialise');},100);
			console.log('service initialised');
			
		}); 

		// We need a function to query the log-in state. We can't simply return the log-in state below, since that would hard-code the initial (null) value. 
		function isLoggedIn(){
			return loggedIn; 
		};

		return {isLoggedIn:isLoggedIn}; 

	}]);