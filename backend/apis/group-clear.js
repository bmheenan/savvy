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

function groupClearPreAuth(request, response) {
	log.line("Clear group", 1);
	gatekeeper.gate(request, response, groupClear);
}

function groupClear(request, response, token) {
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

function deleteAllChannels(request, response) {
	const query = data.store().createQuery("channel")
	.hasAncestor(data.store().key(["group", request.body.groupToClear]))
	.select("__key__");
	data.store().runQuery(query, (error, results) => { deleteChannels(error, results, response); });
}

function deleteChannels(error, channelsToDelete, response) {
	const keys = channelsToDelete.map((channel) => {
		return channel[data.store().KEY];
	});
	data.store().delete(keys, (error) => { respond(error, response); });
}

function respond(error, response) {
	if (error) {
		log.line("Could not delete channels", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	response.status(200).send(JSON.stringify({
		success: true
	}));
}