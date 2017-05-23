/*
TEST: API/CHANNEL-GET

Simluates a client to test the get channels API
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

describe("api/channel-get-list", function() {
	this.slow(1000);
	this.timeout(5000);
	
	var jsonWebToken;
	
	// Make sure the test user exists. If not, create it
	before(function(done) {
		this.timeout(10000);	// This one might take a while
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
				setGroup();
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
					setGroup();
				});
			}
		});
		
		// Clear the group, then set up some channels in it
		function setGroup() {
			chai.request(server)
			.post("/api/group-clear")
			.set("x-access-token", jsonWebToken)
			.send({
				groupToClear: cred.group
			})
			.end(function(error1, response1) {
				expect(response1).to.have.status(200);
				expect(JSON.parse(response1.text).success).to.equal(true);
				chai.request(server)
				.post("/api/channel-new")
				.set("x-access-token", jsonWebToken)
				.send({
					name: "group-1"
				})
				.end(function(error2, response2) {
					expect(response2).to.have.status(200);
					expect(JSON.parse(response2.text).success).to.equal(true);
					chai.request(server)
					.post("/api/channel-new")
					.set("x-access-token", jsonWebToken)
					.send({
						name: "group-2"
					})
					.end(function(error3, response3) {
						expect(response3).to.have.status(200);
						expect(JSON.parse(response3.text).success).to.equal(true);
						chai.request(server)
						.post("/api/channel-new")
						.set("x-access-token", jsonWebToken)
						.send({
							name: "group-1-1",
							parent: ["group-1"]
						})
						.end(function(error4, response4) {
							expect(response4).to.have.status(200);
							expect(JSON.parse(response4.text).success).to.equal(true);
							done();
						});
					});
				});
			});
		}
	});
	
	it("must respond with status 400 to requests without a token", function(done) {
		chai.request(server)
		.post("/api/channel-get-list")
		.send({
			path: [cred.group]
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});
	
	it("must respond with status 400 to requests where the token doesn't match the group requested", function(done) {
		chai.request(server)
		.post("/api/channel-get-list")
		.set("x-access-token", jsonWebToken)
		.send({
			path: ["not-a-matching-group"]
		})
		.end(function(error, response) {
			expect(response).to.have.status(400);
			done();
		});
	});
	
	it("must return a list of top level channels when only the group name is provided", function(done) {
		chai.request(server)
		.post("/api/channel-get-list")
		.set("x-access-token", jsonWebToken)
		.send({
			path: [cred.group]
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.length).to.equal(2);
			expect(responseTxt[0].name).to.equal("group-1");
			expect(responseTxt[1].name).to.equal("group-2");
			done();
		})
	});
	
	it("must return a list of channels under the given channel when one is provided", function(done) {
		chai.request(server)
		.post("/api/channel-get-list")
		.set("x-access-token", jsonWebToken)
		.send({
			path: [cred.group, "group-1"]
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			const responseTxt = JSON.parse(response.text);
			expect(responseTxt.length).to.equal(1);
			expect(responseTxt[0].name).to.equal("group-1-1");
			done();
		});
	});
	
	it("must return an empty list for a valid group without any channels", function(done) {
		chai.request(server)
		.post("/api/group-clear")
		.set("x-access-token", jsonWebToken)
		.send({
			groupToClear: cred.group
		})
		.end(function(error, response) {
			expect(response).to.have.status(200);
			expect(JSON.parse(response.text).success).to.equal(true);
			chai.request(server)
			.post("/api/channel-get-list")
			.set("x-access-token", jsonWebToken)
			.send({
				path: [cred.group]
			})
			.end(function(error2, response2) {
				expect(response2).to.have.status(200);
				const responseTxt = JSON.parse(response2.text);
				expect(response2).to.be.json;
				expect(responseTxt.length).to.equal(0);
				done();
			});
		})
	});
});