/*
ROUTER

Sets up server and directs all incoming traffic to the server
*/
"use strict";

// Requires
const express = require("express");
const http = require("http");
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
	var server = http.createServer(app);
	
	// Set headers and format request
	app.use(function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
		res.setHeader('Access-Control-Allow-Credentials', true);
		next();
	});
	app.use(parser.urlencoded({ extended: true }));
	app.use(parser.json());
	
	// Will redirect all external traffic to https
	// Adapted from express-force-https
	app.use(function(req, res, next) {
		var schema = (req.headers["x-forwarded-proto"] || "").toLowerCase();
  		if (schema !== "https" && req.headers.host.indexOf("localhost") < 0 && req.headers.host.indexOf("127.0.0.1") < 0) {
    		res.redirect("https://" + req.headers.host + req.url);
  		} else {
    		next();
  		}
	});
	
	// Make front end accessible to traffic
	app.use(express.static("./frontend"));
	
	// All GET and POST requests to /api/ get handled by api.js
	app.get("/api/*", api.get);
	app.post("/api/*", api.post);
	
	// Start listening
	server.listen(port, (error) => { onListen(error, "http", port) });
}

function onListen(error, name, activePort) {
	if (error) {
		log.line("Error trying to set up server:", "error");
		log.line(error, "error");
		return;
	}
	log.line(`${name} server listening on port ${activePort}`, 0);
}