'use strict';

angular.module('eventbox',[])

	.directive('eventbox', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/eventbox.html', 
			scope: {event: '=eventDetails'}
		};
	})
	
	.controller('EventboxController', ['$scope','dateUtility', function($scope, dateUtility){
		$scope.dateString = dateUtility.dateString($scope.event.startDate, $scope.event.endDate);
		$scope.countdown = dateUtility.countdown($scope.event.startDate);
	}]);