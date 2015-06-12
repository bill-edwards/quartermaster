'use strict';

angular.module('viewEvent',[])
	.controller('ViewEventController', ['$scope', '$routeParams', '$http', '$location','$rootScope','authSyncService','dateUtility', function($scope, $routeParams, $http, $location, $rootScope, authSyncService, dateUtility){
		
		// Gatekeeper
		authSyncService.authStatus(function(){

			var eventId = $routeParams.eventId; 

			$http.get('api/event/' + eventId)
			.success(function(data){
				$scope.event = data; 
				$scope.event.startDate = new Date(Number($scope.event.startDate));
				$scope.event.endDate = new Date(Number($scope.event.endDate));
				$scope.dateString = dateUtility.dateString($scope.event.startDate, $scope.event.endDate);
				$scope.countdown = dateUtility.countdown($scope.event.startDate);
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