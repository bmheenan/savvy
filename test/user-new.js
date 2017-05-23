/*
TEST: API/USER-NEW

Simulates a client to test the backend normally, testing creating users through api/user-new
*/
"use strict";

// Suppress normal console logging
process.env.NODE_ENV = "test";

// Requires
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const server = require("../backend/router").app;
const cred = require("./credentials").accounts[0];

/////////////
// Control //
/////////////

chai.use(chaiHttp);

describe("api/user-new", function() {
	this.slow(1000);
	this.timeout(5000);

	var jsonWebToken;

	/*
	Before starting, we need to try to login as the test account and delete it if it already exists, since we'll be creating it as part of the test.
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
			if (responseTxt.success === false && responseTxt.reason === "Username not found") {
				// Apparently the test account was deleted previously. Great, we're good to start the test
				done();
			} else {
				expect(responseTxt.success).to.be.true;
				expect(responseTxt.token).to.not.be.empty;
				// We successfully logged into the test account. Now let's delete it, so we can recreate it during the tests
				chai.request(server)
				.post("/api/user-delete")
				.set("x-access-token", responseTxt.token)
				.send({
					usernameToDelete: cred.username
				})
				.end(function(error, response) {
					expect(response).to.have.status(200);
					done();
				})
			}
		});
	})

	it("must not accept usernames that are too short", function(done) {
		chai.request(server)
		.post("/api/user-new")
		.send({
			username: "aaa",
			password: cred.password,
			group: cred.group
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.be.false;
			expect(responseTxt.reason).to.not.be.empty;
			done();
		});
	});

	it("must not accept usernames with invalid characters", function(done) {
		chai.request(server)
		.post("/api/user-new")
		.send({
			username: "aaaa$",
			password: cred.password,
			group: cred.group
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.be.false;
			expect(responseTxt.reason).to.not.be.empty;
			done();
		});
	});

	it("must return a 400 error when a field is missing", function(done) {
		chai.request(server)
		.post("/api/user-new")
		.send({
			username: cred.username,
			password: cred.password,
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});

	it("must not accept weak passwords", function(done) {
		chai.request(server)
		.post("/api/user-new")
		.send({
			username: cred.username,
			password: "123",
			group: cred.group
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.be.false;
			expect(responseTxt.reason).to.not.be.empty;
			done();
		});
	});

	it("must create a new user when fields are valid, and return a json web token", function(done) {
		chai.request(server)
		.post("/api/user-new")
		.send({
			username: cred.username,
			password: cred.password,
			group: cred.group
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.be.true;
			expect(responseTxt.token).to.not.be.empty;
			jsonWebToken = responseTxt.token;
			done();
		});
	});

	it("must return a json web token that will work for later athentication", function(done) {
		chai.request(server)
		.get("/api/test-hello")
		.set("x-access-token", jsonWebToken)
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(JSON.parse(response.text).message).to.not.be.empty;
			done();
		});
	});

	it("must not allow a user to be created if the username is already taken", function(done) {
		chai.request(server)
		.post("/api/user-new")
		.send({
			username: cred.username,
			password: cred.password,
			group: cred.group
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.be.false;
			expect(responseTxt.reason).to.not.be.empty;
			done();
		});
	});
	
	it("must create a new group for the user", function(done) {
		chai.request(server)
		.post("/api/channel-get-list")
		.set("x-access-token", jsonWebToken)
		.send({
			path: [cred.group]
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			done();
		})
	});
});