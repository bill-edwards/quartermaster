'use strict';

angular.module('welcome',[])
	
	// Controller for page as a whole. 
	.controller('WelcomeController', ['$scope','$location','authSyncService', function($scope, $location, authSyncService){

	}])

	// Controller for login pane. 
	.controller('LoginController',['$scope','$http','$location','$rootScope', function($scope, $http, $location, $rootScope){
		
		$scope.username='';
		$scope.password='';
		$scope.errorMessage='';
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
				.error(function(err, status){
					if (status==401){
						$scope.errorMessage = "Too many failed log-in attempts: please wait five minutes."
					}
					else if (status==404){
						$scope.errorMessage = "Username/Password incorrect";
					}
					else if (status==500){
						$scope.errorMessage = "Sorry, there was a problem connecting to the server. Please try again.";
					}
					else console.log('unknown error');
				});
			}
		};
	}])

	// Controller for sign-up pane.
	.controller('SignupController',['$scope','$http','$location','$rootScope', function($scope, $http, $location, $rootScope){

		$scope.username='';
		$scope.password='';
		$scope.errorMessage='';
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
				.error(function(err, status){
					if (status==400){
						$scope.errorMessage = "This username is taken - please choose another";
					}
					else if (status==500){
						$scope.errorMessage = "Sorry, there was a problem connecting to the server. Please try again.";
					}
					else console.log('unknown error');
				});
			}
		};
	}]);
	