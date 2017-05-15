/*
TEST: ZOMBIE/SIGN IN

Uses a headless browser to test the sign in process

"use strict";

// Suppress normal console logging
process.env.NODE_ENV = "test";

// Requires
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const server = require("../backend/router").app;
const cred = require("./credentials").accounts[0];
const Browser = require("zombie");

/////////////
// Control //
/////////////

describe.skip("browser/sign-in", function() {
	// Currently skipping, zombie isn't working the way I expect
	this.slow(3000);
	this.timeout(6000);
	
	Browser.localhost("savvy.bheenan.com", 8080);
	var browser = new Browser();
	
	/*
	Ensure the test account is created; we're going to use it
	
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
					done();
				});
			}
		});	
	});
	
	it("loads the sign in page", function(done) {
		browser.visit("/", function(error) {
			expect(browser.query(".login")).to.exist;
			done();
		})
	});
	
	it("requires the user to fill in all the fields", function(done) {
		browser.fill("#usernameInput", cred.username);
		browser.clickLink("#loginButton", function(error) {
			expect(browser.query(".serverResponse").innerHTML).to.equal("Please specify a username and password");
			done();
		});
	});
	
	it("doesn't allow a user to sign in with the wrong password", function(done) {
		browser.fill("#usernameInput", cred.username);
		browser.fill("#passwordInput", cred.password + "123");
		browser.clickLink("#loginButton", function(error) {
			expect(browser.query(".serverResponse").innerHTML).to.equal("Incorrect password");
			done();
		});
	});
	
	it("allows a user to log in with the right credentials", function(done) {
		browser.fill("#usernameInput", cred.username);
		browser.fill("#passwordInput", cred.password);
		browser.clickLink("#loginButton", function(error) {
			expect(browser.query(".sidebar")).to.not.be.undefined;
			done();
		});
	});
	
	it("stays logged in when the user navigates or refreshes", function(done) {
		browser.reload();
		setTimeout(function() {
			expect(browser.query(".sidebar")).to.not.be.undefined;
			done();
		}, 1000);
	});
});
*/