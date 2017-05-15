/*
USER-AUTHENTICATE

Checks to see if username and password are correct, and returns a web token
*/
"use strict";

// Requires
const data = require("../data");
const log = require("../logger");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../jwt-secret");
const hasFields = require("../has-fields");
const hasher = require("password-hash");

// Variables
const noUserFoundMessage = "Username not found";
const badPasswordMessage = "Incorrect password";

// Public
module.exports = {
	userAuthenticate
}

/////////////
// Control //
/////////////

/*
Authenticates a user. Expects request.body to contain a username and a password, and verifies that they match an existing user. If it matches, the response will contain:
	success: true,
	token: <a JSON web token for requests that require authentication>
If there's no match, the response will contain:
	success: false,
	reason: <reason>
*/
function userAuthenticate(request, response) {
	log.line("Authenticate user", 1);
	
	if (!hasFields.has(request.body, ["username", "password"])) {
		log.line("Request to authenticate was missing fields", "error");
		log.line(JSON.stringify(request.body), 2);
		response.sendStatus(400);
		return;
	}
	
	data.store().get(data.store().key(["user", request.body.username]), (error, user) => {
		checkFieldsAndRespond(error, user, request, response);
	});
}

/*
Once we have the matching user from the database, verify and respond
*/
function checkFieldsAndRespond(error, user, request, response) {
	if (error) {
		log.line("Error trying to retreive users", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	
	response.setHeader("Content-Type", "application/json");
	
	// Check to see if the username exists
	if (!user) {
		log.line(`User ${request.body.username} not found`, 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: noUserFoundMessage
		}));
		return;
	}
	
	// Now check the password
	if (!hasher.verify(request.body.password, user.password)) {
		log.line("Password did not match", 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: badPasswordMessage
		}));
		return;
	}
	
	// If we get here, the password is good. Return the token
	response.status(200).send(JSON.stringify({
		success: true,
		token: jwt.sign({
			username: user.username,
			group: user.group
		}, jwtSecret.secret, {
			expiresIn: "7 days"
		})
	}));
	log.line("Successfully signed in", 2);
}