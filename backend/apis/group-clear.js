/*
API/GROUP-CLEAR

Removes all channels and messages from a given group
*/
"use strict";

// Requires
const log = require("../logger");
const data = require("../data");
const gatekeeper = require("../jwt-gatekeeper");

// Public
module.exports = {
	groupClear: groupClearPreAuth
}

////////////
// Contol //
////////////

/*
Clears out all messages, channels, and waypoints for the given group
request			must contain groupToClear, which must match the json web token
*				This function only works in test mode. In production, it returns code 403
*/
function groupClearPreAuth(request, response) {
	log.line("Clear group", 1);
	gatekeeper.gate(request, response, groupClear);
}

function groupClear(request, response, token) {
	if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "test-log") {
		log.__("Cannot clear a group when not in test mode");
		response.sendStatus(403);
		return;
	}
	if (request.body.groupToClear && request.body.groupToClear === token.group) {
		deleteAllChannels(request, response);
	} else if (!request.body.groupToClear) {
		log.line("No group provided", "error");
		respone.sendStatus(400);
	} else {
		log.line("Group to clear did not match token. Nothing cleared", 2);
		response.status(200).send(JSON.stringify({
			success: false,
			reason: "Group name did not match token"
		}));
	}
}

// CHANNELS

function deleteAllChannels(request, response) {
	const query = data.store().createQuery("channel")
	.hasAncestor(data.store().key(["group", request.body.groupToClear]))
	.select("__key__");
	data.store().runQuery(query, (error, results) => { deleteChannels(error, results, request, response); });
}

function deleteChannels(error, channelsToDelete, request, response) {
	const keys = channelsToDelete.map((channel) => {
		return channel[data.store().KEY];
	});
	data.store().delete(keys, (error) => { deleteAllMessages(error, request, response); });
}

// MESSAGES

function deleteAllMessages(error, request, response) {
	if (error) {
		log.error("Could not delete channels");
		log.error(error);
		response.sendStatus(500);
		return;
	}
	const query = data.store().createQuery("message")
	.filter("group", "=", request.body.groupToClear)
	.select("__key__");
	data.store().runQuery(query, (error, results) => { deleteMessages(error, results, request, response); });
}

function deleteMessages(error, messagesToDelete, request, response) {
	const keys = messagesToDelete.map((message) => {
		return message[data.store().KEY];
	});
	data.store().delete(keys, (error) => { deleteAllWaypoints(error, request, response); });
}

// WAYPOINTS

function deleteAllWaypoints(error, request, response) {
	if (error) {
		log.error("Could not delete messages");
		log.error(error);
		response.sendStatus(500);
		return;
	}
	const query = data.store().createQuery("waypoint")
	.filter("group", "=", request.body.groupToClear)
	.select("__key__");
	data.store().runQuery(query, (error, results) => { deleteWaypoints(error, results, request, response); });
}

function deleteWaypoints(error, waypointsToDelete, request, response) {
	const keys = waypointsToDelete.map((waypoint) => {
		return waypoint[data.store().KEY];
	});
	data.store().delete(keys, (error) => { respond(error, response); });
}

// DONE

function respond(error, response) {
	if (error) {
		log.line("Could not delete waypoints", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	log.line("Success", 2);
	response.status(200).send(JSON.stringify({
		success: true
	}));
}