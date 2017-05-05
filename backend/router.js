/*
ROUTER

Sets up server and directs all incoming traffic to the server
*/
"use strict";

// Requires
const express = require("express");
const log = require("./logger");
const api = require("./api");
const parser = require("body-parser");

// Variables
const port = 8080;
var app = express();

// Public
module.exports = {
	app
};

/////////////
// Control //
/////////////

go();

/*
Set up for routing all incoming requests, formatting them for the APIs, and starting listening
*/
function go() {	
	// Make front end accessible to traffic
	app.use(express.static("./frontend"));
	
	// Set headers and format request
	app.use(function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
		res.setHeader('Access-Control-Allow-Credentials', true);
		next();
	});
	app.use(parser.urlencoded({ extended: true }));
	app.use(parser.json());
	
	// All GET and POST requests to /api/ get handled by api.js
	app.get("/api/*", api.get);
	app.post("/api/*", api.post);
	
	// Start listening
	app.listen(port, onListen);
}

function onListen(error) {
	if (error) {
		log.line("Error trying to set up server:", "error");
		log.line(error, "error");
		return;
	}
	log.line(`Listening on port ${port}`, 0);
}