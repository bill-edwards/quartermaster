'use strict';

angular.module('dateUtility',[])

	.factory('dateUtility', [function(){
		
		function countdown(eventDate){
			// Calculate days remaining until date, rounding up. 
			var daysDifference = Math.ceil((eventDate - Date.now()) / (24*60*60*1000)); 

			// Tomorrow! 
			if (daysDifference==1) return "1 day to go!";
			// Within a month: countdown in days. 
			else if (daysDifference <= 30) return daysDifference+" days to go!";
			// Within three months: countdown in weeks. 
			else if (daysDifference > 30 && daysDifference <= 90) return Math.floor(daysDifference/7)+" weeks to go!";
			// Otherwise: countdown in months. 
			else return Math.floor(daysDifference/30)+" months to go!";
		};

		function dateString(startDate, endDate){
			// JS Date functions return numbers for months, so need a conversion array. 
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; 

			// One-day event. 
			if (startDate.valueOf()==endDate.valueOf()) return startDate.toDateString();

			// Multi-day events. 
			// Event spans two years:
			if (startDate.getFullYear()!=endDate.getFullYear()) return startDate.toDateString()+" - "+endDate.toDateString(); 
			// Event spans two months: 
			else if (startDate.getMonth()!=endDate.getMonth()) return startDate.getDate()+' '+months[startDate.getMonth()]+' - '+endDate.getDate()+' '+months[endDate.getMonth()]+' '+startDate.getFullYear();
			else return startDate.getDate()+'-'+endDate.getDate()+' '+months[startDate.getMonth()]+' '+startDate.getFullYear();;

		};

		return {countdown:countdown, dateString:dateString}; 

	}]);