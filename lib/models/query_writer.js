'use strict';

var queryWriter = {};

queryWriter.select = function(table, search){

	var queryString = "SELECT * FROM "+table+" WHERE ";
	var fields = Object.keys(search); 
	fields.forEach(function(field){
		queryString += field+"='"+search[field]+"' AND ";
	});
	// Remove the last 'AND' from the query string. 
	queryString = queryString.slice(0, -5);
	return queryString; 
};

queryWriter.insert = function(table, data){

	var fields = Object.keys(data); 
	var fieldString = '(';
	var valueString = '(';
	fields.forEach(function(field){
		fieldString += field+", ";
		valueString += "'"+data[field]+"', ";
	});
	// Remove the last commas and spaces, and close brackets. 
	fieldString = fieldString.slice(0, -2)+')';
	valueString = valueString.slice(0, -2)+')';

	var queryString = "INSERT INTO "+table+" "+fieldString+" VALUES "+valueString;
	return queryString; 
};

queryWriter.update = function(table, id, data){

	var queryString = "UPDATE "+table+" SET ";
	var fields = Object.keys(data); 
	fields.forEach(function(field){
		queryString += field+"='"+data[field]+"', ";
	});
	// Remove the last comma from the query string. 
	queryString = queryString.slice(0, -2);
	queryString += " WHERE id='"+id+"'";
	return queryString; 
};

queryWriter.repeatedOr = function(field, valuesArray){

	var orString = "";
	valuesArray.forEach(function(value){
		orString += field+" ='"+value+"' OR ";
	});
	orString = orString.slice(0, -4);
	return orString; 
};

module.exports = queryWriter; 
