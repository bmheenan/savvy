/*
TEST: API/USER-AUTHENTICATE

Simulates a client to test the api/user-authenticate functionality
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

describe("api/user-authenticate", function() {
	this.slow(1000);
	this.timeout(5000);

	var jsonWebToken;
	
	/*
	Before starting, make sure the test account exists
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
				// It already exists; we can start the tests
				done();
			} else {
				expect(responseTxt.reason).to.equal("Username not found");
				// It doesn't already exist; create it
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
					// Test account created
					done();
				});
			}
		});	
	});
	
	it("must return a 400 error if the username is missing", function(done) {
		chai.request(server)
		.post("/api/user-authenticate")
		.send({
			password: cred.password
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});
	
	it("must return a 400 error if the password is missing", function(done) {
		chai.request(server)
		.post("/api/user-authenticate")
		.send({
			username: cred.username
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});
	
	it("must return a failure when the password is not correct", function(done) {
		chai.request(server)
		.post("/api/user-authenticate")
		.send({
			username: cred.username,
			password: cred.password + "!"
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			expect(JSON.parse(response.text).success).to.be.false;
			done();
		});
	});
	
	it("must succeed and return a json web token when the username and password match", function(done) {
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
			expect(responseTxt.success).to.be.true;
			expect(responseTxt.token).to.not.be.empty;
			jsonWebToken = responseTxt.token;
			done();
		});
	});
	
	it("must return a json web token that will work for later authentication", function(done) {
		chai.request(server)
		.get("/api/test-hello")
		.set("x-access-token", jsonWebToken)
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(response).to.be.json;
			expect(JSON.parse(response.text).message).to.equal(`Hello, ${cred.username}! You are part of the ${cred.group} group.`);
			done();
		});
	});
});