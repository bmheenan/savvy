/*
TEST: API/MESSAGE-NEW

Simulates a client adding new messages to a channel
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

describe("api/message-new", function() {
	this.slow(1000);
	this.timeout(5000);

	var jsonWebToken;
	
	/*
	Before starting, make sure the test account and channel exists
	*/
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
					name: "a-channel"
				})
				.end(function(error2, response2) {
                    expect(response2).to.have.status(200);
                    expect(JSON.parse(response2.text).success).to.equal(true);
                    done();
				});
			});
		}
	});

    it("must not allow a message to be added without a valid token", function(done) {
        chai.request(server)
        .post("/api/message-new")
        .send({
            author: cred.username,
            text: "New message",
            path: [cred.group, "a-channel"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(400);
            done();
        });
    });

    it("must not allow a message to be added when the group doesn't match the user's credentials", function(done) {
		chai.request(server)
		.post("/api/message-new")
		.set("x-access-token", jsonWebToken)
		.send({
			author: cred.username,
			text: "New message - THIS SHOULD NEVER BE INSERTED",
			path: [cred.group + "abc", "a-channel"]
		})
		.end(function(error, response) {
			expect(response).to.have.status(403);
			done();
		});
	});

	it("must not allow a message to be added when posting as a different user", function(done) {
		chai.request(server)
		.post("/api/message-new")
		.set("x-access-token", jsonWebToken)
		.send({
			author: cred.username + "abc",
			text: "New message - THIS SHOULD NEVER BE INSERTED",
			path: [cred.group, "a-channel"]
		})
		.end(function(error, response) {
			expect(response).to.have.status(403);
			done();
		});
	});

    it("must return success when a message is added", function(done) {
        chai.request(server)
        .post("/api/message-new")
        .set("x-access-token", jsonWebToken)
        .send({
            author: cred.username,
            text: "New message",
            path: [cred.group, "a-channel"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(200);
            expect(JSON.parse(response.text).success).to.equal(true);
            done();
        });
    });

	it("must insert the message, so it can be found later", function(done) {
		setTimeout(function() {
			chai.request(server)
			.post("/api/message-get-list")
			.set("x-access-token", jsonWebToken)
			.send({
				path: [cred.group, "a-channel"]
			})
			.end(function(error, response) {
				expect(response).to.have.status(200);
				const responseTxt = JSON.parse(response.text);
				expect(responseTxt.length).to.equal(1);
				expect(responseTxt[0].author).to.equal(cred.username);
				expect(responseTxt[0].text).to.equal("New message");
				done();
			});
		}, 1000);
	});

	it("must return success when a second message is added with the same info", function(done) {
        chai.request(server)
        .post("/api/message-new")
        .set("x-access-token", jsonWebToken)
        .send({
            author: cred.username,
            text: "New message",
            path: [cred.group, "a-channel"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(200);
            expect(JSON.parse(response.text).success).to.equal(true);
            done();
        });
    });

	it("must insert the second message, and both can be read", function(done) {
		setTimeout(function() {
			chai.request(server)
			.post("/api/message-get-list")
			.set("x-access-token", jsonWebToken)
			.send({
				path: [cred.group, "a-channel"]
			})
			.end(function(error, response) {
				expect(response).to.have.status(200);
				const responseTxt = JSON.parse(response.text);
				expect(responseTxt.length).to.equal(2);
				expect(responseTxt[0].author).to.equal(cred.username);
				expect(responseTxt[0].text).to.equal("New message");
				expect(responseTxt[1].author).to.equal(cred.username);
				expect(responseTxt[1].text).to.equal("New message");
				done();
			});
		}, 1000);
	});
});