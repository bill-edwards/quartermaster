'use strict';

angular.module('editEvent',[])

	// Controller for page. 
	.controller('EditEventController', ['$scope', '$routeParams', '$http', '$location','$rootScope','authSyncService','validate', function($scope, $routeParams, $http, $location, $rootScope, authSyncService, validate){

		// Gatekeeper
		authSyncService.authStatus(function(){
			$rootScope.$broadcast('initialise');

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

				// If name, start- or end-date are being edited, (validate), and add to update data. 
				if ($scope.nameField!=$scope.event.name) updateData.name = $scope.nameField; 
				if ($scope.startDateField!=$scope.event.startDate) updateData.startDate = $scope.startDateField.valueOf(); 
				if ($scope.endDateField!=$scope.event.endDate) updateData.endDate = $scope.endDateField.valueOf(); 

				// Submit data to server. 
				$http.put('api/event/' + eventId, updateData)
				.success(function(data){
					$location.path('/view/event/'+$scope.event.id);
				})
				.error(function(err, status){
					console.log('unknown error');
				});
			};
		});
	}]);
