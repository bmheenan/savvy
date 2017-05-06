/*
INDEX

Sets up front end
*/
"use strict";

// Globals
var jsonWebToken;

/////////////
// Control //
/////////////

document.addEventListener("DOMContentLoaded", function(e) {
	// If we have a valid token, use it
	if (getCookie("jsonWebToken")) {
		jsonWebToken = getCookie("jsonWebToken");
	}
	
	// If no token, present the login screen
	if (!jsonWebToken) {
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