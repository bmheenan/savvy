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
const pathfinder = require("../pathfinder");

// Public
module.exports = {
	channelGetList: channelGetPreAuth
}

/////////////
// Control //
/////////////

/*
Gets a list of channels underneath the given channel
request		must have a path, an array of [group, channel, channel, ...]
response	will return an array of objects each representing channels directly under the given channel/group with:
				name: the name of the channel
				path: the path of the channel
*/
function channelGetPreAuth(request, response) {
	log.line("Get channel list", 1);
	gatekeeper.gate(request, response, getChannels);
}

/*
Once authenticated, do the work of the API
*/
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

	var formattedPath = pathfinder.toVerbose(path);
	var pathString = pathfinder.toString(path);
	
	const query = data.store().createQuery("channel")
	.filter("parent", "=", pathString);
	data.store().runQuery(query, (error, results) => { returnResults(error, results, response); });
}

/*
Format and return results
*/
function returnResults(error, results, response) {
	if (error) {
		log.line("Error getting channels", "error");
		log.line(error, "error");
		response.sendStatus(500);
		return;
	}
	
	response.setHeader("Content-Type", "application/json");
	const formattedResults = results.map((channel) => {
		return {
			name: channel.name,
			path: pathfinder.toSimple(channel[data.store().KEY].path)
		};
	});
	log.line(`Returning ${formattedResults.length} channels`, 2);
	response.status(200).send(formattedResults);
}