/*
USER-NEW

Adds a new user to the database - ensuring it's a valid username - and returns a token to authenticate them
*/
"use strict";

// Requires
const data = require("../data");
const log = require("../logger");
const hasher = require("password-hash");
const cred = require("../credentials");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../jwt-secret");
const hasFields = require("../has-fields");

// Variables
const nameAlreadyTakenMessage = "Username is already being used";

// Public
module.exports = {
	userNew
};

/////////////
// Control //
/////////////

/*
Adds a new user. Expects request to contain a username, password, and group. If the user is added successfully, response will contain:
	success: true,
	token: <a JSON web token for requests that require authentication>
If the user cannot be added (name already taken, invalid format, missing field), then response will contain:
	success: false,
	reason: <reason>
*/
function userNew(request, response) {
	log.line("New user", 1);
	
	// Verify request
	if (!hasFields.has(request.body, ["username", "password", "group"])) {
		log.line("Request for new user was missing fields", "error");
		log.line(JSON.stringify(request.body), "error");
		response.sendStatus(400);
		return;
	}
	
	response.setHeader("Content-Type", "application/json");
	
	// Verify user's input
	if (!cred.isValidUsername(request.body.username)) {
		log.line("Not a valid username", 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: "Username " + cred.invalidUsernameMessage
		}));
		return;
	}
	
	if (!cred.isValidPassword(request.body.password)) {
		log.line("Not a valid password", 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: "Password " + cred.invalidPasswordMessage
		}));
		return;
	}
	
	if (!cred.isValidGroupName(request.body.group)) {
		log.line("Not a valid group", 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: "Group " + cred.invalidUsernameMessage
		}));
		return;
	}
	
	// Search for the username among exisiting users to ensure it's new
	data.store().get(data.store().key(["user", request.body.username]), (error, result) => {
		checkUniquenessAndAdd(error, result, request, response);
	});
}

/*
Once we have the list of users, verify this username is unique, and then add it to the database
*/
function checkUniquenessAndAdd(error, result, request, response) {
	if (error) {
		log.line("Could not check if username exists", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	
	// If the previous query returned something, the name is already taken
	if (result) {
		log.line("Username already exists", 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: nameAlreadyTakenMessage
		}));
		return;
	}
	
	// Otherwise, create the new user
	const hashedPassword = hasher.generate(request.body.password);
	const entity = {
		key: data.store().key([
			"user",
			request.body.username.toLowerCase(),
			]),
		data: data.toDatastore({
			username: request.body.username.toLowerCase(),
			password: hashedPassword,
			group: request.body.group.toLowerCase(),
			created: new Date()
		}, ["password", "created"])
	};
	
	const group = {
		key: data.store().key(["group", request.body.group.toLowerCase()]),
		data: data.toDatastore({
			active: true
		}, ["active"])
	}
	
	data.store().upsert(group).then(() => {
		data.store().save(entity, (error) => { respond(error, request, response) });
	});
}

/*
Once the datastore confirms the insert, respond to the request with success and a JSON web token
*/
function respond(error, request, response) {
	if (error) {
		log.line("Error saving new user to datastore", "error");
		log.ling(error, "error");
		response.sendStatus(500);
		return;
	}
	
	log.line("Successfully inserted new user", 2);
	response.status(200).send(JSON.stringify({
		success: true,
		token: jwt.sign({
			username: request.body.username.toLowerCase(),
			group: request.body.group.toLowerCase()
		}, jwtSecret.secret, {
			expiresIn: "7 days"
		})
	}));
}