/*
DATA

Utility for interacting with the datastore
*/
"use strict";

// Requires
const datastore = require("@google-cloud/datastore");
const log = require("./logger");

// Variables
const projectId = "savvy-post";
var store;

// Public
module.exports = {
	toDatastore,
	toApp,
	store
};

/////////////
// Control //
/////////////

go();

function go() {
	store = datastore({
		projectId: projectId
	});
	log.line("Datastore initialized", 0);
}

/*
Returns a reference to the datastore
*/
function store() {
	return store;
}

/*
Converts an entity in an easy format for the app to use to the correct format for the datastore. Returns the same entity in the new format

element		The element to convert in the form:
				key: value,
				key: value
dontIndex	The list of keys to avoid indexing (optional)
*/
function toDatastore(element, dontIndex) {
	dontIndex = dontIndex || [];
	var results = [];
	for (var key in element) {
		if (element[key] === undefined) {
			break;
		}
		results.push({
			name: key,
			value: element[key],
			excludeFromIndexes: dontIndex.indexOf(key) !== -1
		});
	}
	return results;
}

/*
Converts an entity in the datastore format, and makes it easier to use in the app. Returns the same object in the new format

element		The element from the datastore to convert
*/
function toApp(element) {
	element.id = element[datastore.KEY].id;
	return element;
}