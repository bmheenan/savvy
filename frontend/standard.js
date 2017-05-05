/*
STANDARD

Helper functions to make the front end easier to code
*/
"use strict";

/////////////
// Control //
/////////////

/*
Get an element from a query string
*/
const $ = document.querySelector.bind(document);

/*
Get a list of elements from a query string
*/
const $$ = document.querySelectorAll.bind(document);

/*
For GET and POST requests to the backend

params			A JSON object containing:
	type		either "GET" or "POST"
	url			The url the API to call, e.g. "api/getMessages"
	data		JSON object for POSTs
	sendToken	if true, includes json web token in request header
	callback	callback(error, response)
*/
function ajax(params) {
	if (!validAjaxRequest(params)) {
		if (params.callback) {
			setTimeout(params.callback("Error: invalid request. Not sent to server"), 1);
		}
		return;
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open(params.type, params.url);
	xhr.onreadystatechange = function() {
		if (xhr.readyState > 3) { params.callback(undefined, xhr.responseText); }
	}
	if (params.sendToken) {
		xhr.setRequestHeader("x-access-token", jsonWebToken);
	}
	if (params.type === "GET") {
		xhr.send();
	}
	if (params.type === "POST") {
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.send(JSON.stringify(params.data));
	}
	return xhr;
	
	/* Basic first level check that an ajax request is well formed */
	function validAjaxRequest(params) {
		if (!(params.url && params.type)) {
			return false;
		}
		if (!(params.type === "GET" || params.type === "POST")) {
			return false;
		}
		return true;
	}
};

/*
Loads an html file into a location, or a javascript file and executes it

params			A JSON object containing:
	path		The path to the resource to be loaded
	stage		The DOM element to load the file into, as a query string, if html
	callback	callback(error)
*/
function load(params) {
	ajax({
		type: "GET",
		url: params.path,
		callback: loadComplete
	});
	
	function loadComplete(error, response) {
		if (error) {
			console.log(`Error loading ${params.path}`);
			if (params.callback) { params.callback(error); }
			return;
		}
		if (params.path.substr(params.path.length - 5) === ".html") {
			$(params.stage).innerHTML = response;
		} else if (params.path.substr(params.path.length - 3) === ".js") {
			eval(response);
		}
		if (params.callback) { params.callback(undefined) };
	}
}