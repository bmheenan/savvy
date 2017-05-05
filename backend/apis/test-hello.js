/*
TEST-HELLO

Verifies the user is logged in, and responds with a greeting.
*/
"use strict";

// Requires
const log = require("../logger");
const gatekeeper = require("../jwt-gatekeeper");

// Public
module.exports = {
	testHello: testHelloPreAuth
}

/////////////
// Control //
/////////////

/*
Responds with a simple hello message containing information from the JSON web token. Intended to test authentication and routing.
*/
function testHelloPreAuth(request, response) {
	log.line("Hello message", 1);
	gatekeeper.gate(request, response, testHello);
}

/*
Once jwt-gatekeeper has authenticated the request, respond
*/
function testHello(request, response, token) {
	response.setHeader("Content-Type", "application/json");
	response.status(200).send(JSON.stringify({
		message: `Hello, ${token.username}! You are part of the ${token.group} group.`
	}))
	log.line("Responded", 2);
}