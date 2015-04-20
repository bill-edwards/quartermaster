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
				console.log("QMErr: Log-out could not be completed, please try again");
			});
    	};

	}]);