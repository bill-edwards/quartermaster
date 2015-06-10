'use strict';

angular.module('editEvent',[])

	// Controller for page. 
	.controller('EditEventController', ['$scope', '$routeParams', '$http', '$location','$rootScope','authSyncService','validate', function($scope, $routeParams, $http, $location, $rootScope, authSyncService, validate){

		// Gatekeeper
		$scope.$on('initialise', function(){
			if (!authSyncService.isLoggedIn()) $location.path('/welcome');
		});

		var eventId = $routeParams.eventId; 
		$scope.errors = {
			name:"",
			startDate:"",
			endDate:""
		};

		// Get inventory data from server. 
		$http.get('api/event/' + eventId)
		.success(function(data){
			$scope.event = data; 
			$scope.event.startDate = new Date(Number($scope.event.startDate));
			$scope.event.endDate = new Date(Number($scope.event.endDate));
			$scope.event.inventory.items.forEach(function(item){
				item.editStatus='O';
				item.inOut='in';
			});
			$scope.nameField = $scope.event.name; // Must be named separately so we can detemine if it has been changed when saving changes. 
			$scope.startDateField = $scope.event.startDate; 
			$scope.endDateField = $scope.event.endDate; 
		})
		.error(function(err, status){
			console.log('unknown error');
		});

		// Submit changes to back-end. 
		$scope.saveChanges = function(){

			// Clear any error messages from last submission. 
			$scope.errors = {name:""};

			// Assemble arrays of added and removed items. 
			var addedItems = [];
			var removedItems = [];
			$scope.event.inventory.items.forEach(function(item){
				if(item.inOut=='in' && item.editStatus=='A'){
					addedItems.push(item.id);
				}
				else if(item.inOut=='out' && item.editStatus=='O'){
					removedItems.push(item.id);
				}
			});
			var updateData = {addedItems: addedItems, removedItems:removedItems};

			// If inventory name is being edited, validate, and add to update data. 
			if ($scope.nameField!=$scope.event.name) {
				updateData.name = $scope.nameField; 
				var errors = validate(updateData, 'inventory', ['name']);
				if (errors){
					$scope.errors = errors; 
					return;
				}
			}

			// Submit data to server. 
			$http.put('api/event/' + eventId, updateData)
			.success(function(data){
				$location.path('/view/event/'+$scope.event.id);
			})
			.error(function(err, status){
				console.log('unknown error');
			});
		};
	}]);
