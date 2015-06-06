'use strict';

angular.module('itemList',[])

	.directive('itemList', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/item_list.html', 
			scope: {items: '=itemsDetails'}
		};
	})

	.controller('ItemListController', ['$scope', function($scope){

		$scope.ordering = 'name';
		$scope.show = {status:'!4'}; 

	}]);