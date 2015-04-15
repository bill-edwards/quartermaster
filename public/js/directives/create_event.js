'use strict';

angular.module('createEvent',[])

	.directive('createEvent', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/create_event.html', 
			scope: {}
		};
	})

	.controller('CreateEventController', ['$scope', function($scope){
		$scope.name = "Event name";
	}]);