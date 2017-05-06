/*
USER-DELETE

Deletes a user from the datastore. Must be logged in as the user being deleted.
*/
"use strict";

// Requires
const log = require("../logger");
const data = require("../data");
const gatekeeper = require("../jwt-gatekeeper");

// Public
module.exports = {
	userDelete: userDeletePreAuth
}

/////////////
// Control //
/////////////

/*
Deletes the user specified, as long as the json web token authenticates to the user being deleted (i.e. the user is requesting their own account be deleted)

request		must have a valid jwt, and request.body.usernameToDelete must match its username
response	if successful, will contain:
				success: true
			otherwise will contain:
				success: false,
				reason: <reason>
*/
function userDeletePreAuth(request, response) {
	log.line("Delete user", 1);
	gatekeeper.gate(request, response, userDelete);
}

/*
Once gatekeeper has verified and decoded the token, ensure the usernames match and delete
*/
function userDelete(request, response, token) {
	response.setHeader("Content-Type", "application/json");
	if (token.username !== request.body.usernameToDelete) {
		log.line("Username did not match token; nothing deleted", 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: "Username to delete did not match json web token"
		}));
		return;
	}
	if (!(token.username.length > 0)) {
		log.line("Username in token is empty", "error");
		response.sendStatus(400);
		return;
	}
	
	data.store().delete(data.store().key(["user", token.username]), (error) => {
		onDeleteComplete(error, response);
	});
}

/*
Respond to the client after the delete operation is complete
*/
function onDeleteComplete(error, response) {
	if (error) {
		log.line("Error trying to delete the user with the key");
		log.line(error);
		response.sendStatus(500);
		return;
	}
	response.status(200).send(JSON.stringify({
		success: true
	}));
}