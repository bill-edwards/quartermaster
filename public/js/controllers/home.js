'use strict';

angular.module('home',[])
	.controller('InvListController', ['$scope', '$http', '$location','authSyncService','validate', function($scope, $http, $location, authSyncService, validate){

		// Gatekeeper
		$scope.$on('initialise', function(){
			if (!authSyncService.isLoggedIn()) $location.path('/welcome');
		});
		
		// Retrieve data from server. 
		$http.get('api/user/me')
		.success(function(data){
			$scope.inventories=data.inventories; 
		})
		.error(function(err){
			console.log("QMErr: Data could not be retrieved from server");
		});

		// Control the create-inventory pane. 
		$scope.newInventory = "";
		$scope.error = "";

		$scope.createInventory = function(){
			// Don't allow submission if field is empty. 
			if ($scope.newInventory){

				// First reset any non-empty error fields. 
				$scope.error="";

				// Next validate contents of fields.
				var errors = validate({name:$scope.newInventory}, 'inventory', ['name']);
				if (errors) {
					$scope.error = errors.name; 
					return;
				}

				$http.post('/api/inventory/new',{name:$scope.newInventory})
				.success(function(data){
					// Re-direct to edit-inventory page. 
					$location.path('/edit/inventory/'+data.id);
					console.log(data.id);
				})
				.error(function(err){
					console.log("QMErr: Data could not be retrieved from server");
				});
			}
		};

	}]);