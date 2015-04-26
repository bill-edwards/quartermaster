'use strict';

angular.module('titlebar',[])

	.directive('titlebar', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/titlebar.html'
		};
	})

	.controller('TitlebarController', ['$scope','$http','$location','authSyncService', function($scope, $http, $location, authSyncService){
		
		// Control visibility of titlebar according to log-in state. 

		$scope.loggedIn = false; 

		$scope.$on('initialise',function(){
        	$scope.loggedIn = authSyncService.isLoggedIn();
    	});

    	$scope.$on('login',function(){
        	$scope.loggedIn = true;
    	});

    	$scope.$on('logout',function(){
        	$scope.loggedIn = false;
    	});


    	// Define behaviour of log-out button. 

    	$scope.logout = function(){
    		$http.post('/api/logout')
			.success(function(data){ 
				// Broadcast logout event to tell titlebar to become hidden. 
				$scope.$broadcast('logout');
				// Re-direct to welcome page.
				$location.path('/welcome');
			})
			.error(function(err){
				if (status==500){
					window.alert("Sorry, there was a problem connecting to the server. Please try again.");
				}
				else console.log('unknown error');
			});
    	};

	}]);