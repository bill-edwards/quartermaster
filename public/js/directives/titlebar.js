'use strict';

angular.module('titlebar',[])

	.directive('titlebar', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/titlebar.html'
		};
	})

	// Control visibility of titlebar according to log-in state. 
	.controller('TitlebarController', ['$scope', 'authSyncService', function($scope, authSyncService){
		
		$scope.loggedIn = false; 

		$scope.$on('initialise',function(){
        	$scope.loggedIn = authSyncService.isLoggedIn();
    	});

    	$scope.$on('login',function(){
        	$scope.loggedIn = true;
    	});

	}]);