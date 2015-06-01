'use strict';

angular.module('dateUtility',[])

	.factory('dateUtility', [function(){
		
		function countdown(eventDate){
			// Calculate days remaining until date, rounding up. 
			var daysDifference = Math.ceil((eventDate - Date.now()) / (24*60*60*1000)); 

			// Within a month: countdown in days. 
			if (daysDifference <= 30) return daysDifference+" days to go!";
			// Within three months: countdown in weeks. 
			else if (daysDifference > 30 && daysDifference <= 90) return Math.floor(daysDifference/7)+" weeks to go!";
			// Otherwise: countdown in months. 
			else return Math.floor(daysDifference/30)+" months to go!";
		};

		function dateFormat(eventDate){
			
		};

		return {countdown:countdown, dateFormat:dateFormat}; 

	}]);