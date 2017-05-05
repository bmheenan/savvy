/*
ROUTER

Sets up server and directs all incoming traffic to the server
*/
"use strict";

// Requires
const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const log = require("./logger");
const api = require("./api");
const parser = require("body-parser");

// Variables
const port = 8080;
const portSsl = 443;
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
	// Setup to force SSL
	var sslOptions = {
		key: fs.readFileSync("./ssl/savvy.key"),
		cert: fs.readFileSync("./ssl/savvy.crt")
	};
	var server = http.createServer(app);
	var secureServer = https.createServer(sslOptions, app);
	
	// Set headers and format request
	app.use(function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
		res.setHeader('Access-Control-Allow-Credentials', true);
		next();
	});
	app.use(parser.urlencoded({ extended: true }));
	app.use(parser.json());
	
	// Will redirect all traffic to https
	// Adapted from express-force-https
	app.use(function(req, res, next) {
		var schema = (req.headers['x-forwarded-proto'] || '').toLowerCase();
  		if (req.headers.host.indexOf("localhost") < 0 && req.headers.host.indexOf("127.0.0.1") < 0 && schema !== "https") {
    		res.redirect('https://' + req.headers.host + req.url);
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
	secureServer.listen(portSsl, onListen);
	server.listen(port, onListen);
}

function onListen(error) {
	if (error) {
		log.line("Error trying to set up server:", "error");
		log.line(error, "error");
		return;
	}
	// We should see this line twice: once for the http server and once for the https
	log.line("Server listening", 0);
}