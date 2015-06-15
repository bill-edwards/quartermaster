'use strict';

angular.module('createEvent',[])

	.directive('createEvent', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/create_event.html', 
			scope: {inventories: '=inventories'}
		};
	})

	.controller('CreateEventController', ['$scope','$http','$location','$rootScope', 'validate', function($scope, $http, $location, $rootScope, validate){

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
		$scope.checkboxes = {};

		// Control visibility of inventory checkboxes. 
		$scope.visibleInvs = false; 
		$scope.toggle = function(){
			$scope.visibleInvs = !$scope.visibleInvs; 
		};

		// Handle form submission. 
		$scope.submit = function(){

			if ($scope.multiDay=='one') $scope.endDate = $scope.startDate; 

			// Next validate contents of fields. 
			var errors = validate({name:$scope.name}, 'event', ['name']); 
			if (errors) {
				$scope.errors = errors; 
				return;
			}

			// Start date must be today or later. 
			if ($scope.startDate<(now-86400000)) {
				$scope.errors.startDate = "Start date should be in the future";
				return; 
			}

			// End date must be later than start date. 
			if ($scope.endDate<$scope.startDate){
				$scope.errors.endDate = "Event must end after it starts!";
				return; 
			}

			// Assemble array of checked inventories. 
			var checkedInvs = [];
			for (var invId in $scope.checkboxes){
				if ($scope.checkboxes[invId]) checkedInvs.push(Number(invId));
			}

			// Make request to back-end. 
			$http.post('api/event/new', {name:$scope.name, startDate:$scope.startDate.valueOf(), endDate:$scope.endDate.valueOf(), invIds:checkedInvs})
			.success(function(data){
				$location.path('/view/event/'+data.id);
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

