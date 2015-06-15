'use strict';

angular.module('home',[])
	.controller('HomeController', ['$scope', '$http', '$location','$rootScope','authSyncService', function($scope, $http, $location, $rootScope, authSyncService){

		// Gatekeeper
		authSyncService.authStatus(function(){

			// Retrieve data from server.
			$http.get('api/user/me')
			.success(function(data){
				// Set properties on scope using returned data. 
				$scope.inventories=data.inventories; 
				$scope.events=data.events; 
				var now = Date.now(); 
				$scope.events.forEach(function(event){ 
					event.startDate = new Date(Number(event.startDate));
					event.endDate = new Date(Number(event.endDate));
					event.upcoming = (now<event.endDate);
				});
				$rootScope.$broadcast('initialise');
			})
			.error(function(err, status){
				if (status==401){
					window.alert('You seem to have been logged out. Please log-in to continue.');
					// Broadcast logout event to tell titlebar to become hidden. 
					$rootScope.$broadcast('logout');
					// Re-direct to welcome page.
					$location.path('/welcome');
				}
				else console.log("QMErr: Data could not be retrieved from server");
			});
		});
	}])

	.controller('InvListController', ['$scope', '$http', '$location','$rootScope','validate', function($scope, $http, $location, $rootScope, validate){

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
				})
				.error(function(err, status){
					if (status==400){
						$scope.error = "You already have another inventory with this name";
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
					else console.log('unknown error');
				});
			}
		};

	}]);