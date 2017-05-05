/**
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
	if (!jsonWebToken) {
		load({
			path: "login/login.html",
			stage: "#stage",
			callback: () => { load({ path: "login/login.js" }); }
		});
	}
});