'use strict';

angular.module('editInventory',[])

	// Controller for page. 
	.controller('EditInvController', ['$scope', '$routeParams', '$http', '$location','authSyncService', function($scope, $routeParams, $http, $location){

		// Gatekeeper
		$scope.$on('initialise', function(){
			if (!authSyncService.isLoggedIn()) $location.path('/welcome');
		});

		var invId = $routeParams.invId; 

		// Get inventory data from server. 
		$http.get('api/inventory/' + invId)
		.success(function(data){
			$scope.inventory = data; 
			$scope.inventory.items.forEach(function(item){
				item.editStatus='O';
				item.inOut='in';
			});
			$scope.invNameField = $scope.inventory.name; // Must be named separately so we can detemine if it has been changed when saving changes. 
			console.log(data);
		})
		.error(function(err){
			console.log("QMErr: Data could not be retrieved from server");
		});

		// On submission, prepare data for return to server. 
		$scope.saveChanges = function(){
			var newItems = [];
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
			if ($scope.invNameField!=$scope.inventory.name) updateData.name = $scope.invNameField; 
			$http.put('api/inventory/' + invId, updateData)
			.success(function(data){
				$location.path('/view/inventory/'+$scope.inventory.id);
			})
			.error(function(err){
				console.log("QMErr: Data could not be retrieved from server");
			});
		};
	}])

	// Controller for in/out boxes on page. 
	.controller('InOutBoxController', ['$scope', function($scope){
		$scope.remove = function(){
			$scope.item.inOut = 'out'; 
		};
		$scope.reinstate = function(){
			$scope.item.inOut = 'in'; 
		};
	}])

	// Controller for create-item box. 
	.controller('CreateItemController', ['$scope', '$http', function($scope, $http){
		$scope.name = ""; 
		$scope.addItem = function(){
			if ($scope.name)
			{
				$http.post('api/item/new', {name:$scope.name, invId:$scope.inventory.id})
				.success(function(data){
					var newItem = {id:data, name:$scope.name, inOut:"in", editStatus:"O"};
					$scope.inventory.items.push(newItem);
					$scope.name = "";
				})
				.error(function(err){
					console.log(err.message);
				});
			}
		};
	}]);