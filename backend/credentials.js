/*
CREDENTIALS

Validates that usernames and passwords meet requrements.
*/
"use strict";

// Variables
const invalidUsernameMessage = "must be at least 4 characters, and can contain only letters and numbers";
const invalidPasswordMessage = "must be at least 8 characters, and can contain only letters, numbers, and the special characters: ~, !, @, #, $, %, ^, &, *, ., _, -, <space>, and ?";

// Public
module.exports = {
	invalidUsernameMessage,
	invalidPasswordMessage,
	isValidUsername,
	isValidPassword
};

/////////////
// Control //
/////////////

/*
Confirms that the input meets the requirements for a username. Group names use the same rules. Returns a boolean.

username	the input to validate
*/
function isValidUsername(username) {
	// At least 4 characters
	if (username.length < 4) { return false; }
	
	// Only contains valid characters
	var usernameLower = username.toLowerCase();
	for (var i = 0; i < usernameLower.length; i++) {
		var code = usernameLower.charCodeAt(i);
		if (!(code > 47 && code < 58) &&			// 0 - 9
			!(code > 96 && code < 123)) {			// a - z
			return false;
		}
	}
	return true;
}

/*
Confirms that the input meets the requirements for a group name, which is the same rules as a username. Returns a boolean.

name		the input to validate
*/
function isValidGroupName(name) {
	return isValidUsername(name);
}

/*
Confirms that the input meets the requirements of a password. Returns a boolean.

password	the input to validate
*/
function isValidPassword(password) {
	// At least 8 characters
	if (password.length < 8) { return false; }
	
	// Only contains valid characters
	const validSpecial = "~!@#$%^&*?.-_ ";
	for (var i = 0; i < password.length; i++) {
		var char = password.charAt(i);
		var code = password.charCodeAt(i);
		if (!(code > 47 && code < 58) &&			// 0 - 9
		    !(code > 64 && code < 91) &&			// A - Z
			!(code > 96 && code < 123) &&			// a - z
			!(validSpecial.indexOf(char) >= 0)) {	// special
			return false;
		}
	}
	return true;
}