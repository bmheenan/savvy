/*
LOGIN

Allow the user to sign up or log in
*/
"use strict";

login();

function login() {
	$("#loginButton").addEventListener("click", login);
	$("#passwordInput").addEventListener("keydown", loginKey);
	$("#signupButton").addEventListener("click", signup);
	$("#groupInput").addEventListener("keydown", signupKey);

	function loginKey(e) {
		if (e.keyCode === 13) { login(); }
	}

	function login(e) {
		if (e) { e.preventDefault(); }
		if ($("#usernameInput").value.length > 0 &&
			$("#passwordInput").value.length > 0) {
			ajax({
				type: "POST",
				url: "api/user-authenticate",
				data: {
					username: $("#usernameInput").value,
					password: $("#passwordInput").value,
				},
				callback: returnFromSubmit
			});
		} else {
			$(".login .responseArea .serverResponse").innerHTML = "Please specify a username and password";
		}
	}

	function signupKey(e) {
		if (e.keyCode === 13) {signup(); }
	}

	function signup(e) {
		if (e) { e.preventDefault(); }
		if ($("#usernameInput").value.length > 0 &&
			$("#passwordInput").value.length > 0 &&
			$("#groupInput").value.length > 0 &&
			// Don't let users accidentally sign up reseverved names used for testing, becuase their data will get deleted any time a test is run
			$("#groupInput").value.toLowerCase() !== "internaltest" &&
			$("#usernameInput").value.toLowerCase() !== "testusername") {
			ajax({
				type: "POST",
				url: "api/user-new",
				data: {
					username: $("#usernameInput").value,
					password: $("#passwordInput").value,
					group: $("#groupInput").value,
				},
				callback: returnFromSubmit
			});
		} else if ($("#groupInput").value.toLowerCase() === "internaltest") {
			$(".login .responseArea .serverResponse").innerHTML = "You cannot use that group name";
		} else if ($("#usernameInput").value.toLowerCase() === "testusername") {
			$(".login .responseArea .serverResponse").innerHTML = "You cannot use that username";
		} else {
			$(".login .responseArea .serverResponse").innerHTML = "Please specify a username, password, and group";
		}
	}

	function returnFromSubmit(error, response) {
		if (error) { console.log(error); }
		response = JSON.parse(response);
		if (response.success) {
			globals.jsonWebToken = response.token;
			setCookie("jsonWebToken", response.token);
			globals.username = response.username;
			setCookie("username", response.username);
			globals.group = response.group;
			setCookie("group", response.group);
			load({
				path: "main-view/main-view.html",
				stage: "#stage",
				callback: () => { load({ path: "main-view/main-view.js"}) }
			});
		} else {
			$(".login .responseArea .serverResponse").innerHTML = response.reason;
		}
	}
}