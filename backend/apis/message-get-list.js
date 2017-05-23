/*
CHANNEL-GET

For a given channel (or group), returns messages belonging to it
*/
"use strict";

// Requires
const log = require("../logger");
const data = require("../data");
const gatekeeper = require("../jwt-gatekeeper");
const hasFields = require("../has-fields");
const pathfinder = require("../pathfinder");

// Public
module.exports = {
	messageGetList: getMessagesPreAuth
}

/////////////
// Control //
/////////////

/*
Returns a list of the messages that match the group/channel path provided
request		must contain a path, an array of strings that correspond to the group/channel desired.
*			The user must belong to the group being requested
*/
function getMessagesPreAuth(request, response) {
	log.__("Get channel");
	gatekeeper.gate(request, response, getMessages);
}

function getMessages(request, response, token) {
	if (!hasFields.has(request, ["path"])) {
		log.error("Missing path");
		response.sendStatus(400);
		return;
	}
	
	const path = request.body.path;
	
	if (path.constructor !== Array) {
		log.error("Path was not an array");
		response.sendStatus(400);
		return;
	}
	
	for (var i = 0; i < path.length; i++) {
		if (typeof path[i] !== "string") {
			log.error("Path contained a non-string element");
			response.sendStatus(400);
			return;
		}
	}
	
	if (token.group !== path[0]) {
		log.error("The requested group does not match user's authentication");
		response.sendStatus(403);
		return;
	}
	
	const query = data.store().createQuery("waypoint")
	.filter("path", "=", pathfinder.toString(path));
	data.store().runQuery(query, (error, waypoints) => { getMessagesFromWaypoints(error, waypoints, response) });
}

function getMessagesFromWaypoints(error, waypoints, response) {
	if (error) {
		log.error("Could not get message waypoints from datastore");
		log.error(error);
		response.sendStatus(500);
		return;
	}

	if (waypoints.length === 0) {
		log.__("Returning 0 messages");
		response.status(200).send([]);
		return;
	}
	
	var keys = [];
	for (var i = 0; i < waypoints.length; i++) {
		keys.push(waypoints[i].message);
	}
	
	data.store().get(keys, (error, messages) => { returnMessages(error, messages, response); });
}

function returnMessages(error, messages, response) {
	if (error) {
		log.error("Could not get messages from datastore");
		log.error(error);
		response.sendStatus(500);
		return;
	}
	
	response.setHeader("Content-Type", "application/json");
	
	// Ensures we only return the fields we should, and provide key
	const formattedResults = messages.map((message) => {
		return {
			author: message.author,
			key: message[data.store().KEY],
			text: message.text
		};
	});
	
	log.___("Returning messages");
	response.status(200).send(formattedResults);
}