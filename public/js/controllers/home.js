'use strict';

angular.module('home',[])
	.controller('InvListController', ['$scope', '$http', '$location', function($scope, $http, $location){
	
		// Retrieve data from server. 
		$http.get('api/user/me')
		.success(function(data){
			$scope.inventories=data.inventories; 
			console.log(data);
		})
		.error(function(err){
			console.log("QMErr: Data could not be retrieved from server");
		});

		// Control the create-inventory pane. 
		$scope.newInventory = "";
		$scope.createInventory = function(){
			// Don't allow submission if field is empty. 
			if ($scope.newInventory){
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