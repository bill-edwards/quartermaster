'use strict';

angular.module('editEvent',[])

	// Controller for page. 
	.controller('EditEventController', ['$scope', '$routeParams', '$http', '$location','$rootScope','authSyncService','validate', function($scope, $routeParams, $http, $location, $rootScope, authSyncService, validate){

		// Gatekeeper
		authSyncService.authStatus(function(){

			var now = new Date(Date.now()); 
			var eventId = $routeParams.eventId; 
			$scope.errors = {
				name:"",
				startDate:"",
				endDate:""
			};

			// Get event data from server. 
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
				$scope.multiDay = ($scope.startDateField.valueOf()==$scope.endDateField.valueOf()) ? 'one' : 'multi' ; 
				$rootScope.$broadcast('initialise');
			})
			.error(function(err, status){
				console.log('unknown error');
			});

			// Submit changes to back-end. 
			$scope.saveChanges = function(){

				// Clear any error messages from last submission. 
				$scope.errors = {name:""};

				if ($scope.multiDay=='one') $scope.endDateField = $scope.startDateField; 

				// Next validate event name. 
				var errors = validate({name:$scope.nameField}, 'event', ['name']); 
				if (errors) {
					$scope.errors = errors; 
					return;
				}

				// Start date must be today or later. 
				if ($scope.startDateField<(now-86400000)) {
					$scope.errors.startDate = "Start date should be in the future";
					return; 
				}

				// End date must be later than start date. 
				if ($scope.endDateField<$scope.startDateField){
					$scope.errors.endDate = "Event must end after it starts!";
					return; 
				}

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
