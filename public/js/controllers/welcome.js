'use strict';

angular.module('welcome',[])
	
	// Controller for page as a whole. 
	.controller('WelcomeController', ['$scope','$location','authSyncService', function($scope, $location, authSyncService){

	}])

	// Controller for login pane. 
	.controller('LoginController',['$scope','$http','$location','$rootScope', function($scope, $http, $location, $rootScope){
		
		$scope.username='';
		$scope.password='';
		$scope.submit = function(){
			// Don't allow submission if fields are empty. 
			if ($scope.username && $scope.password){
				$http.post('/api/login',{username:$scope.username, password:$scope.password})
				.success(function(data){ 
					// Broadcast login event to tell titlebar to become visible. 
					$rootScope.$broadcast('login');
					// Re-direct to home page.
					$location.path('/home');
					console.log(data.id);
				})
				.error(function(err){
					console.log("QMErr: Data could not be retrieved from server");
				});
			}
		};
	}])

	// Controller for sign-up pane.
	.controller('SignupController',['$scope','$http','$location','$rootScope', function($scope, $http, $location, $rootScope){

		$scope.username='';
		$scope.password='';
		$scope.submit = function(){
			// Don't allow submission if fields are empty. 
			if ($scope.username && $scope.password){
				$http.post('/api/user/new',{username:$scope.username, password:$scope.password})
				.success(function(data){ 
					// Broadcast login event to tell titlebar to become visible. 
					$rootScope.$broadcast('login');
					// Re-direct to home page.
					$location.path('/home');
					console.log(data.id);
				})
				.error(function(err){
					console.log("QMErr: Data could not be retrieved from server");
				});
			}
		};
	}]);
	