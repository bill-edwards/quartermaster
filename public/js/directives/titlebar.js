'use strict';

angular.module('titlebar',[])

	.directive('titlebar', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/titlebar.html'
		};
	})

	.controller('TitlebarController', ['$scope', 'authSyncService', function($scope, authSyncService){
		
		$scope.loggedIn = false; 

		$scope.$on('initialise',function(){
        	$scope.loggedIn = authSyncService.isLoggedIn();
    	});

	}]);