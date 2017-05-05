/*
LOGGER

Writes to the console in a consistent format, and allows the programmer to set a verbosity to control how much output appears
*/
"use strict";

// Public
module.exports.line = logLine;

// Variables
const prefixMap = {
	0: "",
	1: "  ",
	2: "    ",
	"error": "!!! "
}
var verbosity = 2;	// 0 = only higest level messages
					// 1 = high level and mid level messages
					// 2 = all messages
/////////////
// Control //
/////////////

/*
Logs the input to standard out, formatted according to its level

input	The string to output
level	The level of the message, or error code
*/
function logLine(input, level) {
	if ((level == "error" || level <= verbosity) && process.env.NODE_ENV !== "test") {
		console.log(`${prefixMap[level]}${input}`);
	}
}