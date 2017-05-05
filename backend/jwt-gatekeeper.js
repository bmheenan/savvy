/*
JWT-GATEKEEPER

Utility to make it easy to determine if a token is valid in a request.
*/
"use strict";

// Requires
const jwtSecret = require("./jwt-secret");
const jwt = require("jsonwebtoken");
const log = require("./logger");

// Public
module.exports = {
	gate
};

/////////////
// Control //
/////////////

/*
Designed to be one of the first things an API calls when it's only for authenticated users. It handles authenticating the request.

request		the request from express. Expects request.headers["x-access-token"] to be a json web token
response	the response from express
callback	will only be called if authentication passes. If authentication doesn't pass, this function handles the response to the client gracefully.
			Expects callback(request, response, payload) where payoad is decoded from the token in the request
*/
function gate(request, response, callback) {
	jwt.verify(request.headers["x-access-token"], jwtSecret.secret, (error, payload) => { errorOrPassthrough(error, payload, request, response, callback); });
}

/*
Once JWT has attempted to decode, either error out or pass through to the callback based on the result
*/
function errorOrPassthrough(error, payload, request, response, callback) {
	if (error) {
		log.line("Token did not decode. Authentication failed", 2);
		log.line(error, 2);
		response.status(400).send(JSON.stringify({
			error: "Authentication failed"
		}));
		return;
	}
	
	log.line("Authentication passed", 2);
	callback(request, response, payload);
}