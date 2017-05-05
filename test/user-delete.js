/*
TEST: API/USER-DELETE

Simulates a client to test the api/user-delete functionality
*/
"use strict";

// Suppress normal console logging
process.env.NODE_ENV = "test";

// Requires
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const server = require("../backend/router").app;

// Variables
const cred = {
	username: "testusername",
	password: "password123",
	group: "internaltest"
}

/////////////
// Control //
/////////////

chai.use(chaiHttp);

describe("api/user-delete", function() {
	this.slow(2000);
	this.timeout(5000);

	var jsonWebToken;

	/*
	Before starting the test, log in to the test account, or create it if it doesn't already exist
	*/
	before(function(done) {
		chai.request(server)
		.post("/api/user-authenticate")
		.send({
			username: cred.username,
			password: cred.password
		})
		.end(function(error, response) {
			const responseTxt = JSON.parse(response.text);
			if (responseTxt.success) {
				expect(responseTxt.token).to.not.be.empty;
				jsonWebToken = responseTxt.token;
				done();
			} else {
				expect(responseTxt.reason).to.equal("Username not found");
				chai.request(server)
				.post("/api/user-new")
				.send({
					username: cred.username,
					password: cred.password,
					group: cred.group
				})
				.end(function(errorNew, responseNew) {
					const responseTxtNew = JSON.parse(responseNew.text);
					expect(responseTxtNew.success).to.be.true;
					expect(responseTxtNew.token).to.not.be.empty;
					jsonWebToken = responseTxtNew.token;
					done();
				});
			}
		});	
	});

	it("must not succeed if no token is provided", function(done) {
		chai.request(server)
		.post("/api/user-delete")
		.send({
			usernameToDelete: cred.username
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});

	it("must not succeed if the token is not valid", function(done) {
		chai.request(server)
		.post("/api/user-delete")
		.set("x-access-token", jsonWebToken + "b1")	// Add two characters of garbage to invalidate the token
		.send({
			usernameToDelete: cred.username
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});

	it("must not succeed if the username doesn't match the token", function(done) {
		chai.request(server)
		.post("/api/user-delete")
		.set("x-access-token", jsonWebToken)
		.send({
			usernameToDelete: "incorrectusername"
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.be.false;
			expect(responseTxt.reason).to.equal("Username to delete did not match json web token");
			done();
		});
	});

	it("must succeed if the token is valid and matches the username to delete", function(done) {
		chai.request(server)
		.post("/api/user-delete")
		.set("x-access-token", jsonWebToken)
		.send({
			usernameToDelete: cred.username
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			expect(JSON.parse(response.text).success).to.be.true;
			done();
		});
	});

	it("must remove the user from the datastore when the delete is confirmed", function(done) {
		setTimeout(function() {
			chai.request(server)
			.post("/api/user-authenticate")
			.send({
				username: cred.username,
				password: cred.password
			})
			.end(function(error, response) {
				expect(response).to.have.status(200);
				expect(response).to.be.json;
				const responseTxt = JSON.parse(response.text);
				expect(responseTxt.success).to.be.false;
				expect(responseTxt.reason).to.equal("Username not found");
				done();
			});
		}, 200);	// We perform this test after a small timeout, since strong consistency in Google Cloud datastore is not guaranteed
	});
});