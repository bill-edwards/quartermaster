'use strict';

var qmApp = angular.module('qmApp',['ngRoute','home','viewInventory','eventList','editInventory','titlebar','itembox','eventbox','createEvent']);


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
    .when('/view/events', {
    	templateUrl: 'templates/pages/view_events.html'
    })
    .when('/edit/inventory/:invId', {
    	templateUrl: 'templates/pages/edit_inventory.html'
    })
    .otherwise({
      redirectTo: '/home'
    });
}]);