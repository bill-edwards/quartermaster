'use strict';

angular.module('itembox',[])

	.directive('itembox', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/itembox.html', 
			scope: {item: '=itemDetails'}
		};
	})

	.controller('ItemboxController', ['$scope', '$http', '$location', '$rootScope', 'validate', function($scope, $http, $location, $rootScope, validate){

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
			.error(function(err, status){
				if (status==401){
					window.alert('You seem to have been logged-out. Please log-in to continue.');
					// Broadcast logout event to tell titlebar to become hidden. 
					$rootScope.$broadcast('logout');
					// Re-direct to welcome page.
					$location.path('/welcome');
				}
				else if (status==404){
					$scope.errors.form = "We're having trouble locating this item in our records. Please refresh this page and try again.";
				}
				else if (status==500){
					$scope.errors.form = "Sorry, there was a problem connecting to the server. Please try again.";
				}
				else console.log("QMErr: Data could not be retrieved from server");
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