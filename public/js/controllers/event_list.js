'use strict';

angular.module('eventList',[])
	.controller('EventListController', ['$scope', '$http', 'authSyncService', function($scope, $http, authSyncService){

		// Gatekeeper
		$scope.$on('initialise', function(){
			if (!authSyncService.isLoggedIn()) $location.path('/welcome');
		});

		// Retrieve event data from server. 
		$http.get('data/events.json')
		.success(function(data){
			$scope.events=data; 
			console.log(data);
			$scope.events.forEach(function(event){ 
				event.startDate = new Date(Number(event.startDate));
				event.startDateString = event.startDate.toDateString(); 
				event.endDate = new Date(Number(event.endDate));
				event.endDateString = event.endDate.toDateString(); 
				event.upcoming = ($scope.now<event.endDate);
			});
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