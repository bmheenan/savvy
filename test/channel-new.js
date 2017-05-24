/*
TEST: API/CHANNEL-NEW

Simluates a client to test the new channel API
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

describe("api/channel-new", function() {
	this.slow(1000);
	this.timeout(5000);
	
	var jsonWebToken;
	
	// Make sure the test user exists. If not, create it
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
				// It already exists; we can move on to clearing the group
				clearGroup();
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
					jsonWebToken = responseTxtNew.token;
					// Test account created, now we can clear the group
					clearGroup();
				});
			}
		});
		
		function clearGroup() {
			chai.request(server)
			.post("/api/group-clear")
			.set("x-access-token", jsonWebToken)
			.send({
				groupToClear: cred.group
			})
			.end(function(error, response) {
				expect(response).to.have.status(200);
				expect(JSON.parse(response.text).success).to.equal(true);
				done();
			});
		}
	});
	
	it("must not accept a request with missing fields", function(done) {
		chai.request(server)
		.post("/api/channel-new")
		.set("x-access-token", jsonWebToken)
		.send({
			parent: [cred.group, "not", "real"]
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		})
	});
	
	it("must not accept a request where the parent does not exist", function(done) {
		chai.request(server)
		.post("/api/channel-new")
		.set("x-access-token", jsonWebToken)
		.send({
			parent: [cred.group, "not", "real", "parent", "nothing"],
			name: "newchannel"
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});
	
	it("must create a new channel in a group when no parent is provided", function(done) {
		chai.request(server)
		.post("/api/channel-new")
		.set("x-access-token", jsonWebToken)
		.send({
			name: "newchannel"
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(JSON.parse(response.text).success).to.equal(true);
			done();
		});
	});
	
	it("must not create a channel that already exists", function(done) {
		chai.request(server)
		.post("/api/channel-new")
		.set("x-access-token", jsonWebToken)
		.send({
			name: "newchannel"
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.equal(false);
			expect(responseTxt.reason).to.equal("Channel name is already being used");
			done();
		});
	});
	
	it("must create a new channel when a parent is provided", function(done) {
		chai.request(server)
		.post("/api/channel-new")
		.set("x-access-token", jsonWebToken)
		.send({
			name: "new-new-channel",
			parent: [cred.group, "newchannel"]
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.success).to.equal(true);
			done();
		});
	});
});