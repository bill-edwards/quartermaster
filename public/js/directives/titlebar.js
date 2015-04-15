'use strict';

angular.module('titlebar',[])

	.directive('titlebar', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/titlebar.html'
		};
	});