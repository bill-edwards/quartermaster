'use strict';

angular.module('viewInventory',[])
	.controller('ViewInvController', ['$scope', '$routeParams', '$http', '$location','$rootScope','authSyncService', function($scope, $routeParams, $http, $location, $rootScope, authSyncService){
		
		// Gatekeeper
		authSyncService.authStatus(function(){

			var invId = $routeParams.invId; 

			$http.get('api/inventory/' + invId)
			.success(function(data){
				$scope.inventory = data; 
				$rootScope.$broadcast('initialise');
			})
			.error(function(err, status){
				if (status==401){
					window.alert('You seem to have been logged-out. Please log-in to continue.');
					// Broadcast logout event to tell titlebar to become hidden. 
					$rootScope.$broadcast('logout');
					// Re-direct to welcome page.
					$location.path('/welcome');
				}
				else if (status==404){
					window.alert('We can\'t find any inventory of yours with this id');
					// Re-direct to welcome page.
					$location.path('/home');
				}
				else console.log('unknown error');
			});
		});
	}]);