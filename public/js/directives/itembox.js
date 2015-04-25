'use strict';

angular.module('itembox',[])

	.directive('itembox', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/itembox.html', 
			scope: {item: '=itemDetails'}
		};
	})

	.controller('ItemboxController', ['$scope', '$http', 'validate', function($scope, $http, validate){

		$scope.buttonLabel = "Update status";
		$scope.expanded = false; 

		$scope.toggleBox = function(){
			$scope.expanded=!$scope.expanded; 
			$scope.buttonLabel=$scope.expanded ? "^" : "Update status";
		};

		$scope.newStatus = $scope.item.status; 
		$scope.newIssue = "";
		$scope.errors = {issue:"", form:""};

		$scope.updateStatus = function(newStatus){

			var updateData = {status:newStatus};

			// If issue is being updated, validate the string supplied. 
			if ($scope.newIssue){
				var errors = validate({issue:$scope.newIssue}, 'item', ['issue']);
				if (errors) {
					$scope.errors = errors; 
					return;
				}
				updateData.issue = $scope.newIssue; 
			}
			
			// If validation succeeds, send request to back-end.
			$http.put('api/item/'+$scope.item.id, updateData)
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

		// Needed to clear out 'issue' field when clicking on a different radio button. 
		// This isn't a problem at the back-end, because unless status=2, any 'issue' supplied will be ignored. 
		// However it might be a problem if the issue fails front-end validation, and then we decided to update status to something other than '2'.
		$scope.clearIssue = function(){
			$scope.newIssue="";
			$scope.errors.issue="";
		}

	}]);