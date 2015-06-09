'use strict';

angular.module('editItemList',[])

	.directive('editItemList', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/panes/edit_item_list.html', 
			scope: {inventory: '=inventory'}
		};
	})

	.controller('EditItemListController', ['$scope', function($scope){


	}])

	// Controller for in/out boxes on page. 
	// Parent scope is EditItemListController. 
	.controller('InOutBoxController', ['$scope', function($scope){
		$scope.remove = function(){
			$scope.item.inOut = 'out'; 
		};
		$scope.reinstate = function(){
			$scope.item.inOut = 'in'; 
		};
	}])

	// Controller for create-item box. 
	// Parent scope is EditItemListController. 
	.controller('CreateItemController', ['$scope','$http','$location','$rootScope','validate', function($scope, $http, $location, $rootScope, validate){
		
		$scope.name = ""; 
		$scope.error = "";

		$scope.addItem = function(){

			// Don't allow submission if fields are empty. 
			if ($scope.name)
			{
				// First clear any error messages from previous submission attempts. 
				$scope.error="";

				// Next validate contents of fields. 
				var errors = validate({name:$scope.name}, 'item', ['name']); 
				if (errors) {
					$scope.error = errors.name; 
					return;
				}

				// Submit data to server. 
				$http.post('api/item/new', {name:$scope.name, invId:$scope.inventory.id})
				.success(function(data){
					var newItem = {id:data.id, name:$scope.name, inOut:"in", editStatus:"O"};
					$scope.inventory.items.push(newItem);
					$scope.name = "";
				})
				.error(function(err, status){
					if (status==400){
						$scope.error = "You already have an item with this name";
					}
					else if (status==401){
						window.alert('You seem to have been logged-out. Please log-in to continue.');
						// Broadcast logout event to tell titlebar to become hidden. 
						$rootScope.$broadcast('logout');
						// Re-direct to welcome page.
						$location.path('/welcome');
					}
					else if (status==500){
						$scope.error = "Sorry, there was a problem connecting to the server. Please try again.";
					}
					else console.log("unknown error");
				});
			}
		};
	}])

	// Controller for search-by-inventory section. 
	// Parent scope is EditItemListController. 
	.controller('SearchByInventoryController', ['$http', '$scope', function($http, $scope){
			
		// Query back-end for details of user's inventories. 
		$http.get('api/user/me')
		.success(function(data){
			// Remove the currently edited inventory from the drop-down list. 
			$scope.inventories = data.inventories.filter(function(inventory){
				return inventory.id != $scope.inventory.id; 
			}); 
		})
		.error(function(err){
			console.log('error with getting user details');
		});

		// Initially have no inventory selected. 
		$scope.otherInventoryId = 0;

		// Function called when inventory is selected from drop-down menu. 
		$scope.getItems = function(){
			// If an inventory is selected: 
			if($scope.otherInventoryId!=0) {
				$http.get('api/inventory/'+$scope.otherInventoryId)
				.success(function(data){
					// Filter out items already present in inventory being edited. 
					// Might it be more efficient to maintain a dedicated array of ids of items currently in edited inventory? 
					// The contents of such an id array would be modified at various different points in code. 
					data.items = data.items.filter(function(item){
						var match = false; 
						for (var index in $scope.inventory.items){
							if ($scope.inventory.items[index].id == item.id){
								match = true; 
								break; 
							}
						}
						return !match; 
					});
					$scope.otherInventory = data; 
				})
				.error(function(err){
					console.log('error with retrieving other inventory');
				});
			}
			else $scope.otherInventory = [];
		};

		// Function called when 'add all items' button is pressed. 
		$scope.addAllItems = function(){
			// Deep copy each item, add extra fields, push to array of items in main page scope. 
			$scope.otherInventory.items.forEach(function(item){
				var addedItem = {};
				for (var prop in item){
					addedItem[prop] = item[prop]; 
				}
				addedItem.inOut = 'in';
				addedItem.editStatus = 'A';
				$scope.inventory.items.push(addedItem); 
			});
			// Reset choice of inventory. 
			$scope.otherInventoryId = 0; 
			$scope.otherInventory = []; 
		};

	}])

	// Controller for item boxes from search-by-inventory section. 
	// Parent scope is SearchByInventoryController. 
	.controller('OtherInvItemController', ['$scope', function($scope){

		$scope.addItem = function(){

			// Deep copy item, and add extra fields. 
			var addedItem = {};
			for (var prop in $scope.item){
				addedItem[prop] = $scope.item[prop]; 
			}
			addedItem.inOut = 'in';
			addedItem.editStatus = 'A';
			// Push item into array of items on main page scope. 
			$scope.inventory.items.push(addedItem); 
			// Remove item from array of items on search-by-inventory scope. 
			$scope.otherInventory.items = $scope.otherInventory.items.filter(function(item){
				return item.id != $scope.item.id; 
			});
		};
	}]);