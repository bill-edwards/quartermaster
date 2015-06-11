'use strict';

angular.module('editInventory',[])

	// Controller for page. 
	.controller('EditInvController', ['$scope', '$routeParams', '$http', '$location','$rootScope','authSyncService','validate', function($scope, $routeParams, $http, $location, $rootScope, authSyncService, validate){

		// Gatekeeper
		authSyncService.authStatus(function(){
			$rootScope.$broadcast('initialise');

			var invId = $routeParams.invId; 
			$scope.errors = {name:""};

			// Get inventory data from server. 
			$http.get('api/inventory/' + invId)
			.success(function(data){
				$scope.inventory = data; 
				$scope.inventory.items.forEach(function(item){
					item.editStatus='O';
					item.inOut='in';
				});
				$scope.invNameField = $scope.inventory.name; // Must be named separately so we can detemine if it has been changed when saving changes. 
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
					window.alert('We can\'t find any inventory of yours with this id');
					// Re-direct to welcome page.
					$location.path('/home');
				}
				else console.log('unknown error');
			});

			// Submit changes to back-end. 
			$scope.saveChanges = function(){

				// Clear any error messages from last submission. 
				$scope.errors = {name:""};

				// Assemble arrays of added and removed items. 
				var addedItems = [];
				var removedItems = [];
				$scope.inventory.items.forEach(function(item){
					if(item.inOut=='in' && item.editStatus=='A'){
						addedItems.push(item.id);
					}
					else if(item.inOut=='out' && item.editStatus=='O'){
						removedItems.push(item.id);
					}
				});
				var updateData = {addedItems: addedItems, removedItems:removedItems};

				// If inventory name is being edited, validate, and add to update data. 
				if ($scope.invNameField!=$scope.inventory.name) {
					updateData.name = $scope.invNameField; 
					var errors = validate(updateData, 'inventory', ['name']);
					if (errors){
						$scope.errors = errors; 
						return;
					}
				}

				// Submit data to server. 
				$http.put('api/inventory/' + invId, updateData)
				.success(function(data){
					$location.path('/view/inventory/'+$scope.inventory.id);
				})
				.error(function(err, status){
					if (status==400){
						$scope.errors.name = "You already have an inventory with this name";
					}
					else if (status==401){
						window.alert('You seem to have been logged-out. Please log-in to continue.');
						// Broadcast logout event to tell titlebar to become hidden. 
						$rootScope.$broadcast('logout');
						// Re-direct to welcome page.
						$location.path('/welcome');
					}
					else if (status==404){
						window.alert('We\'re having trouble locating this inventory in our records. Please try again.');
						// Re-direct to welcome page.
						$location.path('/home');
					}
					if (status==500){
						$scope.errors.name = "Sorry, there was a problem connecting to the server. Please try again.";
					}
					else console.log('unknown error');
				});
			};
		});
	}]);
