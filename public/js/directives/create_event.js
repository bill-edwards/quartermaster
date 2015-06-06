'use strict';

angular.module('createEvent',[])

	.directive('createEvent', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/create_event.html', 
			scope: {inventories: '=inventories'}
		};
	})

	.controller('CreateEventController', ['$scope','$http','$location','$rootScope', function($scope, $http, $location, $rootScope){

		// Initialise form fields
		var now = new Date(Date.now()); 
		$scope.startDate = now;
		$scope.endDate = new Date(now.valueOf()+86400000);
		$scope.multiDay = "one"; 
		$scope.errors = {
			name: "",
			startDate: "",
			endDate:"",
			form:""
		};

		$scope.submit = function(){

			if ($scope.multiDay=='one') $scope.endDate = $scope.startDate; 

			if ($scope.startDate<(now-86400000)) {
				$scope.errors.startDate = "Start date should be in the future";
				return; 
			}

			if ($scope.endDate<$scope.startDate){
				$scope.errors.endDate = "Event must end after it starts!";
				return; 
			}

			$http.post('api/event/new', {name:$scope.name, startDate:$scope.startDate.valueOf(), endDate:$scope.endDate.valueOf()})
			.success(function(data){
				$location.path('/view/events');
			})
			.error(function(err, status){
				if (status==401){
					window.alert('You seem to have been logged-out. Please log-in to continue.');
					// Broadcast logout event to tell titlebar to become hidden. 
					$rootScope.$broadcast('logout');
					// Re-direct to welcome page.
					$location.path('/welcome');
				}
				else if (status==500){
					$scope.errors.form = "Sorry, there was a problem connecting to the server. Please try again.";
				}
				else console.log("QMErr: Data could not be retrieved from server");
			});

		};

	}]);

