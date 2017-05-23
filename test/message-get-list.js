/*
TEST: API/MESSAGE-GET-LIST

Emulates a client to test getting a list of messages in a channel
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

describe("api/message-get-list", function() {
	this.slow(1000);
	this.timeout(5000);

	var jsonWebToken;
	
	/*
	Before starting, make sure the test account and channels exists, with a few messages
	*/
	before(function(done) {
		this.timeout(15000);	// This one might take a while
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
					name: "channel-1"
				})
				.end(function(error2, response2) {
					expect(response2).to.have.status(200);
					expect(JSON.parse(response2.text).success).to.equal(true);
					chai.request(server)
					.post("/api/channel-new")
					.set("x-access-token", jsonWebToken)
					.send({
						name: "channel-2"
					})
					.end(function(error3, response3) {
						expect(response3).to.have.status(200);
						expect(JSON.parse(response3.text).success).to.equal(true);
						chai.request(server)
						.post("/api/channel-new")
						.set("x-access-token", jsonWebToken)
						.send({
							name: "channel-1-1",
							parent: ["channel-1"]
						})
						.end(function(error4, response4) {
                            expect(response4).to.have.status(200);
                            expect(JSON.parse(response4.text).success).to.equal(true);
                            chai.request(server)
                            .post("/api/channel-new")
                            .set("x-access-token", jsonWebToken)
                            .send({
                                name: "channel-3",
                            })
                            .end(function(error5, response5) {
                                expect(response5).to.have.status(200);
							    expect(JSON.parse(response5.text).success).to.equal(true);
							    addMessages();
                            });
						});
					});
				});
			});
		}

        // Put some messages in the group
        function addMessages() {
            chai.request(server)
            .post("/api/message-new")
            .set("x-access-token", jsonWebToken)
            .send({
                author: cred.username,
                text: "A message in channel-1",
                path: [cred.group, "channel-1"]
            })
            .end(function(error1, response1) {
                expect(response1).to.have.status(200);
                chai.request(server)
                .post("/api/message-new")
                .set("x-access-token", jsonWebToken)
                .send({
                    author: cred.username,
                    text: "A message in channel-2",
                    path: [cred.group, "channel-2"]
                })
                .end(function(error1, response1) {
                    expect(response1).to.have.status(200);
                    chai.request(server)
                    .post("/api/message-new")
                    .set("x-access-token", jsonWebToken)
                    .send({
                        author: cred.username,
                        text: "A message in channel-1-1",
                        path: [cred.group, "channel-1", "channel-1-1"]
                    })
                    .end(function(error1, response1) {
                        expect(response1).to.have.status(200);
                        done();
                    });
                });
            });
        }
    });

    it("must not return messages wtihout an access token", function(done) {
        chai.request(server)
        .post("/api/message-get-list")
        .send({
            path: [cred.group]
        })
        .end(function(error, response) {
            expect(response).to.have.status(400);
            done();
        });
    });

    it("must not return messages where the group doesn't match the token", function(done) {
        chai.request(server)
        .post("/api/message-get-list")
        .set("x-access-token", jsonWebToken)
        .send({
            path: [cred.group + "abc"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(403);
            done();
        });
    });

    it("must return all messages in a group when only the group is in the path", function(done) {
        this.slow(3000);
	    this.timeout(6000);
        // Messages don't have guaranteed consistency, so we wait a second for the beigin code to settle before checking for messages
        setTimeout(function() {
            chai.request(server)
            .post("/api/message-get-list")
            .set("x-access-token", jsonWebToken)
            .send({
                path: [cred.group]
            })
            .end(function(error, response) {
                expect(response).to.have.status(200);
                expect(JSON.parse(response.text).length).to.equal(3);
                done();
            });
        }, 1000);
    });

    it("must return the messages in a given channel", function(done) {
        chai.request(server)
        .post("/api/message-get-list")
        .set("x-access-token", jsonWebToken)
        .send({
            path: [cred.group, "channel-2"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(200);
            expect(JSON.parse(response.text).length).to.equal(1);
            done();
        });
    });

    it("must return the messages in a given channel, with a subchannel", function(done) {
        chai.request(server)
        .post("/api/message-get-list")
        .set("x-access-token", jsonWebToken)
        .send({
            path: [cred.group, "channel-1"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(200);
            expect(JSON.parse(response.text).length).to.equal(2);
            done();
        });
    });

    it("must return the messages in a given channel, and not a parent channel", function(done) {
        chai.request(server)
        .post("/api/message-get-list")
        .set("x-access-token", jsonWebToken)
        .send({
            path: [cred.group, "channel-1", "channel-1-1"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(200);
            const responseTxt = JSON.parse(response.text);
            expect(responseTxt.length).to.equal(1);
            expect(responseTxt[0].text).to.equal("A message in channel-1-1");
            done();
        });
    });

    it("must return no messages for an empty channel", function(done) {
        chai.request(server)
        .post("/api/message-get-list")
        .set("x-access-token", jsonWebToken)
        .send({
            path: [cred.group, "channel-3"]
        })
        .end(function(error, response) {
            expect(response).to.have.status(200);
            const responseTxt = JSON.parse(response.text);
            expect(responseTxt.length).to.equal(0);
            done();
        });
    });
});
