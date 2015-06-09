'use strict';

angular.module('eventList',[])
	.controller('EventListController', ['$scope', '$http', 'authSyncService', function($scope, $http, authSyncService){

		// Gatekeeper
		$scope.$on('initialise', function(){
			if (!authSyncService.isLoggedIn()) $location.path('/welcome');
		});

		// Retrieve event data from server. 
		$http.get('api/user/me')
		.success(function(data){
			$scope.events=data.events; 
			$scope.events.forEach(function(event){ 
				event.startDate = new Date(Number(event.startDate));
				event.endDate = new Date(Number(event.endDate));
				event.upcoming = ($scope.now<event.endDate);
			});
			$scope.inventories=data.inventories; 
		})
		.error(function(err){
			console.log("QMErr: Data could not be retrieved from server");
		});

		// Toggle visibility of upcoming/past events. 
		$scope.now = Date.now();
		$scope.pastFuture = 1; 
		$scope.setPastFuture = function(value){
			$scope.pastFuture = value; 
			$scope.now = Date.now();
		};
		$scope.filterPastFuture = function(event){
			if ($scope.pastFuture==1) return event.upcoming; 
			if ($scope.pastFuture==-1) return !event.upcoming; 
		};

	}]);