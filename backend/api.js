/*
API

Directs incoming traffic to /api/ to the right module
*/
"use strict";

// Requires
const log = require("./logger");

// Variables
const apiMap = {
	"GET": {
		"test-hello": require("./apis/test-hello").testHello
	},
	"POST": {
		"channel-get-list": require("./apis/channel-get-list").channelGetList,
		"channel-new": require("./apis/channel-new").channelNew,
		"group-clear": require("./apis/group-clear").groupClear,
		"message-get-list": require("./apis/message-get-list").messageGetList,
		"message-new": require("./apis/message-new").messageNew,
		"user-new": require("./apis/user-new").userNew,
		"user-authenticate": require("./apis/user-authenticate").userAuthenticate,
		"user-delete": require("./apis/user-delete").userDelete
	}
};

// Public
module.exports = {
	get,
	post
}

/////////////
// Control //
/////////////

/*
Handles incoming GET requests to the API
*/
function get(request, response) {
	respond(request, response, "GET");
}

/*
Handles incoming POST requests to the API
*/
function post(request, response) {
	respond(request, response, "POST");
}

/*
Directs incoming requests to the right place, baesd on the mapping above in apiMap. Responds with an error code 400 for any api not in apiMap.
*/
function respond(request, response, type) {
	log.line("Routing API request: " + request.url, 0);
	let api = request.url.split("/")[2].toLowerCase();
	if (api in apiMap[type]) {
		apiMap[type][api](request, response);
	} else {
		log.line(`Invalid API attempt: ${api}`, "error");
		response.sendStatus(400);
	}
}