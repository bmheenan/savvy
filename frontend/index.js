/*
INDEX

Sets up front end
*/
"use strict";

// Globals
var globals = {}; 

/////////////
// Control //
/////////////

document.addEventListener("DOMContentLoaded", function(e) {
	// If we have a valid token, use it
	if (getCookie("jsonWebToken") && getCookie("username") && getCookie("group")) {
		globals.jsonWebToken = getCookie("jsonWebToken");
		globals.group = getCookie("group");
		globals.username = getCookie("username");
	}
	
	// If any logged in user info is missing, present the login screen
	if (!globals.jsonWebToken || !globals.username || !globals.group) {
		load({
			path: "login/login.html",
			stage: "#stage",
			callback: () => { load({ path: "login/login.js" }); }
		});
	// If there is a token, load the main view
	} else {
		load({
			path: "main-view/main-view.html",
			stage: "#stage",
			callback: () => { load({ path: "main-view/main-view.js"}) }
		});
	}
});