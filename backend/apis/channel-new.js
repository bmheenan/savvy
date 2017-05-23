/*
CHANNEL-NEW

Adds a new channel to a group, potentially as a child of an existing channel
*/
"use strict";

// Requires
const data = require("../data");
const log = require("../logger");
const gatekeeper = require("../jwt-gatekeeper");
const auth = require("../credentials");

// Public
module.exports = {
	channelNew: channelNewPreAuth
}

/////////////
// Control //
/////////////

/*
Creates a new channel. Expects request to contain a name (that will be validated as a group name) and potentially a parent path. If the creation is successful, response will contain:
	success: true
Otherwise it will contain:
	success: false,
	reason: <reason>
*/
function channelNewPreAuth(request, response) {
	log.line("New channel", 1);
	gatekeeper.gate(request, response, channelNew);
}

/*
Assumes the token has been authenticated. Verify input and create the key for searching the datastore
*/
function channelNew(request, response, token) {
	if (!token.group) {
		log.line("No group in token", "error");
		response.sendStatus(500);
		return;
	}
	var params = request.body;
	if (!params.name) {
		log.line("No name in request", "error");
		response.sendStatus(400);
		return;
	}
	params.name = params.name.toLowerCase();
	
	response.setHeader("Content-Type", "application/json");
	if (!auth.isValidGroupName(params.name)) {
		log.line("Name was not valid", "error");
		response.status(200).send(JSON.stringify({
			success: false,
			reason: "Not a valid channel name"
		}));
		return;
	}
	
	if (params.parent) {
		// This channel will be a child of an existing channel
		// Ensure the parent already exists
		var parentKey = ["group", token.group];
		var parentFilter = token.group + "/";
		for (var i in params.parent) {
			parentKey.push("channel");
			parentKey.push(params.parent[i]);
			parentFilter += params.parent[i] + "/";
		}
		var thisKey = parentKey.slice();
		thisKey.push("channel");
		thisKey.push(params.name);
		data.store().get(data.store().key(parentKey), (error, result) => {
			verifyNewThenInsertNewChannel(error, result, thisKey, parentFilter, response);
		});
	} else {
		verifyNewThenInsertNewChannel(undefined, token.group, ["group", token.group, "channel", params.name], token.group + "/", response);
	}
}

/*
Ensure that if a parent key was provided it exists, then look to see if the channel name is already taken
*/
function verifyNewThenInsertNewChannel(error, parent, key, parentFilter, response) {
	if (error) {
		log.line("Error trying to find parent", "error");
		log.line(JSON.stringify(key), "error");
		response.sendStatus(500);
		return;
	}
	if (!parent) {
		log.line("Parent was not found", "error");
		log.line(JSON.stringify(key), "error");
		response.sendStatus(400);
		return;
	}
	var keyCopy = key.slice();
	data.store().get(data.store().key(key), (errorFromLookup, result) => {
		insertNewChannel(errorFromLookup, result, keyCopy, parentFilter, response);
	});
}

/*
Check to make sure this channel doesn't already exist, then save it
*/
function insertNewChannel(error, result, key, parent, response) {
	if (error) {
		log.line("Error trying to find channel", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	if (result) {
		log.line("Channel already exists", "error");
		response.status(200).send(JSON.stringify({
			success: false,
			reason: "Channel name is already being used"
		}));
		return;
	}
	const name = key[key.length - 1];
	const entity = {
		key: data.store().key(key),
		data: data.toDatastore({
			parent: parent,
			name: name
		}, [])
	};
	data.store().save(entity, (error) => { respond(error, response); });
}

/*
Assuming success, respond back to the client
*/
function respond(error, response) {
	if (error) {
		log.line("error inserting new channel", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	log.line("Success", 2);
	response.status(200).send(JSON.stringify({
		success: true
	}));
}