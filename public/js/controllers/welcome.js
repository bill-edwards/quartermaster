'use strict';

angular.module('welcome',[])
	
	// Controller for page as a whole. 
	.controller('WelcomeController', ['$scope','$location','$rootScope','authSyncService', function($scope, $location, $rootScope, authSyncService){
		$rootScope.$broadcast('initialise');
	}])

	// Controller for login pane. 
	.controller('LoginController',['$scope','$http','$location','$rootScope','validate', function($scope, $http, $location, $rootScope, validate){
		
		$scope.data = {username: '', password: ''};
		$scope.errors = {username: '', password: '', form: ''};

		$scope.submit = function(){

			// Don't allow submission if fields are empty. 
			if ($scope.data.username && $scope.data.password){

				// First reset any non-empty error fields. 
				$scope.errors = {username: '', password: '', form: ''};

				// Next validate contents of fields. 
				var errors = validate($scope.data, 'user', ['username','password']); 
				if (errors) {
					$scope.errors = errors; 
					return;
				}

				// If validation succeeds, submit data to back-end. 
				$http.post('/api/login', $scope.data)
				.success(function(data){ 
					// Broadcast login event to tell titlebar to become visible. 
					$rootScope.$broadcast('login');
					// Re-direct to home page.
					$location.path('/home');
				})
				.error(function(err, status){
					if (status==401){
						$scope.errors.form = "Too many failed log-in attempts: please wait five minutes."
					}
					else if (status==404){
						$scope.errors.form = "Username/Password incorrect";
					}
					else if (status==500){
						$scope.errors.form = "Sorry, there was a problem connecting to the server. Please try again.";
					}
					else console.log('unknown error');
				});

			}
		};

	}])


	// Controller for sign-up pane.
	.controller('SignupController',['$scope','$http','$location','$rootScope','validate', function($scope, $http, $location, $rootScope, validate){

		$scope.data = {username: '', password: ''};
		$scope.errors = {username: '', password: '', form: ''};

		$scope.submit = function(){

			// Don't allow submission if fields are empty. 
			if ($scope.data.username && $scope.data.password){

				// First reset any non-empty error fields.
				$scope.errors = {username: '', password: '', form: ''};

				// Next validate contents of fields. 
				var errors = validate($scope.data, 'user', ['username','password']); 
				if (errors) {
					$scope.errors = errors; 
					return;
				}

				// If validation succeeds, submit data to back-end.
				$http.post('/api/user/new', $scope.data)
				.success(function(data){ 
					// Broadcast login event to tell titlebar to become visible. 
					$rootScope.$broadcast('login');
					// Re-direct to home page.
					$location.path('/home');
				})
				.error(function(err, status){
					if (status==400){
						$scope.errors.form = "This username is taken - please choose another";
					}
					else if (status==500){
						$scope.errors.form = "Sorry, there was a problem connecting to the server. Please try again.";
					}
					else console.log('unknown error');
				});
				
			}
		};

	}]);
	