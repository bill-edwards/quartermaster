'use strict';

angular.module('viewInventory',[])
	.controller('ViewInvController', ['$scope', '$routeParams', '$http', '$location','authSyncService', function($scope, $routeParams, $http, $location, authSyncService){
		
		// Gatekeeper
		$scope.$on('initialise', function(){
			if (!authSyncService.isLoggedIn()) $location.path('/welcome');
		});

		var invId = $routeParams.invId; 
		$scope.ordering = 'name';
		$scope.show = {status:'!4'}; 

		$http.get('api/inventory/' + invId)
		.success(function(data){
			$scope.inventory = data; 
		})
		.error(function(err){
			console.log("QMErr: Data could not be retrieved from server");
		});
		
		$scope.$on('initialise',function(){
			if (!authSyncService.isLoggedIn()) $location.path('/welcome');
		});
		
	}]);