/*
HAS-FIELDS

Utility to check if a request has the desired fields
*/
"use strict";

// Requires
const log = require("./logger");

// Public
module.exports = {
	has
}

/////////////
// Control //
/////////////

/*
Confirms a request has the keys expected. Returns a boolean.

request			The request to validate
requiredKeys	The list of keys to ensure exist
*/
function has(request, requiredKeys) {
	for (var key in requiredKeys) {
		if (!(requiredKeys[key] in request)) {
			log.line("Request is missing " + requiredKeys[key], 2);
			return false;
		}
	}
	return true;
}