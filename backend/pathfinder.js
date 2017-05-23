/*
PATHFINDER

Utility for dealing with paths...
  - Converts between
    - [name, name, name, ...]
	- [type, name, type, name, type, name, ...]
	- "name/name/name/..."
  - Explodes a path into all waypoint paths:
    - [1, 2, 3] => [[1], [1, 2], [1, 2, 3]]

Used for organizing channels and messages
*/

module.exports = {
	toVerbose,
	toSimple,
	toString,
	explodeWaypoints
}

function toVerbose(input) {
	var toReturn = [];
	for (var i = 0; i < input.length; i++) {
		if (i === 0) {
			toReturn.push("group");
		} else {
			toReturn.push("channel");
		}
		toReturn.push(input[i]);
	}
	return toReturn;
}

function toSimple(input) {
	var toReturn = [];
	for (var i = 1; i < input.length; i++) {
		if (i % 2 === 1) {
			toReturn.push(input[i]);
		}
	}
	return toReturn;
}

function toString(input) {
	var toReturn = "";
	for (i in input) {
		toReturn += input[i] + "/";
	}
	return toReturn;
}

function explodeWaypoints(input) {
	var allPaths = [];
	for (var i = 0; i < input.length; i++) {
		allPaths.push(input.slice(0, i + 1));
	}
	return allPaths;
}