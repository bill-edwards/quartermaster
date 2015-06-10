'use strict';

var qmApp = angular.module('qmApp',['ngRoute','ui.bootstrap','authSync','validate','dateUtility','welcome','home','viewInventory','viewEvent','eventList','editInventory','editEvent','titlebar','itembox','eventbox','createEvent','itemList','editItemList']);


// Routing
///////////////////////////

qmApp.config(['$routeProvider', function($routeProvider){
    $routeProvider
    .when('/home', {
      templateUrl: 'templates/pages/home_page.html'
    })
    .when('/view/inventory/:invId', {
      templateUrl: 'templates/pages/view_inventory.html'
    })
    .when('/view/event/:eventId', {
      templateUrl: 'templates/pages/view_event.html'
    })
    .when('/view/events', {
    	templateUrl: 'templates/pages/view_events.html'
    })
    .when('/edit/inventory/:invId', {
    	templateUrl: 'templates/pages/edit_inventory.html'
    })
    .when('/edit/event/:eventId', {
        templateUrl: 'templates/pages/edit_event.html'
    })
    .when('/welcome', {
        templateUrl: 'templates/pages/welcome.html'
    })
    .otherwise({
      redirectTo: '/home'
    });
}]);

qmApp.controller('MainBodyController', ['$scope', function($scope){

    // Initially hide main body, until authorisation state can be determined. 
    $scope.initialised = false; 
    console.log('MainBodyController: first instantiated');
    
    // Show main body as soon as authSync service receives authorisation data from back-end. 
    $scope.$on('initialise',function(){
        $scope.initialised = true;
        console.log('MainBodyController: initialise event listener triggered');
    });
}]);
