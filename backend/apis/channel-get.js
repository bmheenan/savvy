/*
API/CHANNEL-GET

Returns a list of all channels that parent either directly to a group, or to another channel
*/
"use strict";

// Requires
const log = require("../logger");
const data = require("../data");
const gatekeeper = require("../jwt-gatekeeper");
const hasFields = require("../has-fields");

// Public
module.exports = {
	channelGet: channelGetPreAuth
}

/////////////
// Control //
/////////////

function channelGetPreAuth(request, response) {
	log.line("Get channels", 1);
	gatekeeper.gate(request, response, getChannels);
}

function getChannels(request, response, token) {
	if (!hasFields.has(request, ["path"])) {
		log.line("Missing the path of the channel list", "error");
		response.sendStatus(400);
		return;
	}
	const path = request.body.path;
	if (typeof(path[0]) !== "string") {
		log.line("The path is not an array with a string in the first position", "error");
		response.sendStatus(400);
		return;
	}
	if (path[0] != token.group) {
		log.line("The group requested does not match the token", "error");
		response.sendStatus(400);
		return;
	}
	
	var formattedPath = ["group", path[0]];
	var pathString = path[0] + "/";
	for (var i = 1; i < path.length; i++) {
		formattedPath.push("channel");
		formattedPath.push(path[i]);
		pathString += path[i] + "/";
	}
	
	const query = data.store().createQuery("channel")
	.hasAncestor(data.store().key(formattedPath))
	.filter("parent", "=", pathString);
	data.store().runQuery(query, (error, results) => { returnResults(error, results, response); });
}

function returnResults(error, results, response) {
	if (error) {
		log.line("Error getting channels", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	const formattedResults = results.map((channel) => {
		return {
			name: channel.name,
			key: channel[data.store().KEY]
		};
	});
	response.status(200).send(formattedResults);
}