'use strict';

var qmApp = angular.module('qmApp',['ngRoute']);


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


// Directives
///////////////////////////

// Titlebar element
qmApp.directive('titlebar', function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/panes/titlebar.html'
	};
});

// Itembox element
qmApp.directive('itembox', function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/panes/itembox.html', 
		scope: {item: '=itemDetails'}
	};
});

// Eventbox element
qmApp.directive('eventbox', function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/panes/eventbox.html', 
		scope: {event: '=eventDetails'}
	};
});

// Create-event element
qmApp.directive('createEvent', function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/panes/create_event.html', 
		scope: {}
	};
});


// Controllers
///////////////////////////

// Controller for list of inventories. 
qmApp.controller('InvListController', ['$scope', '$http', function($scope, $http){
	
	// Retrieve data from server. 
	$http.get('data/inventories.json')
	.success(function(data){
		$scope.inventories=data; 
		console.log(data);
	})
	.error(function(err){
		console.log("QMErr: Data could not be retrieved from server");
	});

	// Control the create-inventory pane. 
	$scope.expanded = false; 
	$scope.expandCreate = function(){
		$scope.expanded=!$scope.expanded; 
	};
}]);

// Controller for view-inventory page. 
qmApp.controller('ViewInvController', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
	var invId = $routeParams.invId; 

	$scope.ordering = 'name';
	$scope.show = {status:'!4'}; 

	$http.get('api/inventory/' + invId)
	.success(function(data){
		$scope.inventory = data; 
	})
	.error(function(err){
		console.log("QMErr: Data could not be retrieved from server");
	});
}]);

// Controller for itembox. 
qmApp.controller('ItemboxController', ['$scope', function($scope){
	$scope.buttonLabel = "Update status";
	$scope.expanded = false; 
	$scope.newStatus = $scope.item.status; 
	$scope.newIssue = "";
	$scope.toggleBox = function(){
		$scope.expanded=!$scope.expanded; 
		$scope.buttonLabel=$scope.expanded ? "^" : "Update status";
	};
	$scope.updateStatus = function(newStatus){
		$scope.item.status = newStatus; 
		$scope.newStatus = newStatus; 
		$scope.item.issue = (newStatus==2) ? $scope.newIssue : ""; 
		$scope.toggleBox();
	};
}]);

// Controller for list of events. 
qmApp.controller('EventListController', ['$scope', '$http', function($scope, $http){

	// Retrieve event data from server. 
	$http.get('data/events.json')
	.success(function(data){
		$scope.events=data; 
		console.log(data);
		$scope.events.forEach(function(event){ 
			event.startDate = new Date(Number(event.startDate));
			event.startDateString = event.startDate.toDateString(); 
			event.endDate = new Date(Number(event.endDate));
			event.endDateString = event.endDate.toDateString(); 
		});
	})
	.error(function(err){
		console.log("QMErr: Data could not be retrieved from server");
	});

	// Toggle visibility of upcoming/past events. 
	$scope.now = Date.now();
	$scope.pastFuture = 1; 
	$scope.setPastFuture = function(value){
		$scope.pastFuture = value; 
		$scope.now = Date.now();
	};
	$scope.filterPastFuture = function(event){
		return (($scope.pastFuture * $scope.now)<($scope.pastFuture * event.endDate)); 
	};

}]);

// Controller for eventbox. 
qmApp.controller('EventBoxController', ['$scope', function($scope){
}]);

// Controller for create-event pane. 
qmApp.controller('CreateEventController', ['$scope', function($scope){
	$scope.name = "Event name";
}]);

// Controller for edit-inventory page. 
qmApp.controller('EditInvController', ['$scope', '$routeParams', '$http', '$location', function($scope, $routeParams, $http, $location){
	var invId = $routeParams.invId; 

	// Get inventory data from server. 
	$http.get('api/inventory/' + invId)
	.success(function(data){
		$scope.inventory = data; 
		$scope.inventory.items.forEach(function(item){
			item.editStatus='O';
			item.inOut='in';
		});
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
			if(item.inOut=='in' && item.editStatus=='N'){
				newItems.push(item);
			}
			else if(item.inOut=='in' && item.editStatus=='A'){
				addedItems.push(item.id);
			}
			else if(item.inOut=='out' && item.editStatus=='O'){
				removedItems.push(item.id);
			}
		});
		console.log(newItems);
		console.log(removedItems);
		$location.path('/view/inventory/'+$scope.inventory.id);
	};

}]);

// Controller for in-box/out-box on edit-inventory page. 
qmApp.controller('InOutBoxController', ['$scope', function($scope){
	$scope.remove = function(){
		$scope.item.inOut = 'out'; 
	};
	$scope.reinstate = function(){
		$scope.item.inOut = 'in'; 
	};
}]);

// Controller for create-item box on edit-inventory page.
qmApp.controller('CreateItemController', ['$scope', function($scope){
	$scope.name = ""; 
	$scope.addItem = function(){
		if ($scope.name)
		{
			var newItem = {name:$scope.name, inOut:"in", editStatus:"N"};
			$scope.inventory.items.push(newItem);
			$scope.name = "";
		}
	};
}]);


