'use strict';

angular.module('eventbox',[])

	.directive('eventbox', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/eventbox.html', 
			scope: {event: '=eventDetails'}
		};
	})
	
	.controller('EventBoxController', ['$scope', function($scope){
	}]);