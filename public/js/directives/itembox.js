'use strict';

angular.module('itembox',[])

	.directive('itembox', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/itembox.html', 
			scope: {item: '=itemDetails'}
		};
	})

	.controller('ItemboxController', ['$scope', '$http', function($scope, $http){
		$scope.buttonLabel = "Update status";
		$scope.expanded = false; 
		$scope.newStatus = $scope.item.status; 
		$scope.newIssue = "";
		$scope.toggleBox = function(){
			$scope.expanded=!$scope.expanded; 
			$scope.buttonLabel=$scope.expanded ? "^" : "Update status";
		};
		$scope.updateStatus = function(newStatus){
			$http.put('api/item/'+$scope.item.id, {status:newStatus, issue:$scope.newIssue})
			.success(function(data){
				$scope.item.status = newStatus; 
				$scope.newStatus = newStatus; 
				$scope.item.issue = (newStatus==2) ? $scope.newIssue : ""; 
				$scope.toggleBox();
			})
			.error(function(err){
				console.log("QMErr: Data could not be retrieved from server");
			});
		};
	}]);