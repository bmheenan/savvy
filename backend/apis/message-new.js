/*
MESSAGE-NEW

Inserts a new message to a given channel
*/

// Requires
const log = require("../logger");
const data = require("../data");
const gatekeeper = require("../jwt-gatekeeper");
const hasFields = require("../has-fields");
const pathfinder = require("../pathfinder");

// Public
module.exports = {
	messageNew: messageNewPreAuth
}

/////////////
// Control //
/////////////

/*
Inserts a new message in to the database, along with the wayopints to find it
request			Must contain:
					author: the user who wrote the message; must match json web token
					test: the text of the message
					path: the group or channel to insert it into
response		On success, will have status 200 and:
					success: true
*/
function messageNewPreAuth(request, response) {
	log.__("New message");
	gatekeeper.gate(request, response, verifyMessage);
}

/*
Verifies the fields of the message are valid before inserting; assumes authentication has passed
*/
function verifyMessage(request, response, token) {
	if (!hasFields.has(request.body, ["author", "text", "path"])) {
		log.error("Request was missing fields");
		log.error(JSON.stringify(request.body));
		response.sendStatus(400);
		return;
	}
	
	const path = request.body.path;
	
	if (path.constructor !== Array) {
		log.error("Path was not an array");
		response.sendStatus(400);
		return;
	}
	
	for (i in path) {
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
	
	if (token.username !== request.body.author) {
		log.error("The author does not match the user's authentication");
		response.sendStatus(403);
		return;
	}
	
	if (typeof request.body.text !== "string") {
		log.error("The text was not a string");
		response.sendStatus(400);
		return;
	}
	
	// Ensure the path (channel or group) exists
	data.store().get(data.store().key(pathfinder.toVerbose(path)), (error, channel) => { saveMessage(error, channel, request, response) });
}

/*
Assumes the fields of the message are valid and inserts the messsage
*/
function saveMessage(error, channel, request, response) {
	if (error) {
		log.error("Could not determine if channel exists");
		log.error(error);
		response.sendStatus(500);
		return;
	}
	
	if (!channel) {
		log.error("Channel/group does not exist");
		response.sendStatus(400);
		return;
	}
	
	const message = {
		key: data.store().key("message"),
		data: data.toDatastore({
			author: request.body.author,
			group: request.body.path[0],
			text: request.body.text,
			path: request.body.path,
			timestamp: new Date()
		}, ["text", "path"])
	};
	
	data.store().save(message, (error) => { saveWaypoints(error, message, request, response) });
}

/*
Assumes message has been saved, and inserts the associated waypoints
*/
function saveWaypoints(error, message, request, response) {
	if (error) {
		log.error("Could not save message");
		log.error(error);
		response.sendStatus(500);
		return;
	}
	
	var keys = pathfinder.explodeWaypoints(request.body.path);
	var waypoints = [];
	for (var i = 0; i < keys.length; i++) {
		waypoints.push({
			key: data.store().key("waypoint"),
			data: data.toDatastore({
				path: pathfinder.toString(keys[i]),
				group: request.body.path[0],
				message: message.key
			}, ["message"])
		});
	}
	data.store().save(waypoints, (error) => { respond(error, response); });
}

/*
Once everything is saved, respond with success
*/
function respond(error, response) {
	if (error) {
		log.error("Could not save waypoints");
		log.error(error);
		response.sendStatus(500);
		return;
	}
	
	log.__("Sucessfully inserted new message");
	response.status(200).send({
		success: true
	});
}