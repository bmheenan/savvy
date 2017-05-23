/*
TEST: UNIT/PATHFINDER

Tests converting between pth 
*/
"use strict";

// Suppress normal console logging
process.env.NODE_ENV = "test";

// Requires
const chai = require("chai");
const expect = chai.expect;
const path = require("../backend/pathfinder");

/////////////
// Control //
/////////////

describe("unit/pathfinder", function() {
	it("must convert an empty list to an empty list going verbose", function() {
		expect(path.toVerbose([]))
		.to.deep.equal([]);
	});
	
	it("must convert an empty list to an empty list going simple", function() {
		expect(path.toSimple([]))
		.to.deep.equal([]);
	});
	
	it("must convert a single item into a path with a group", function() {
		expect(path.toVerbose(["a-group"]))
		.to.deep.equal(["group", "a-group"]);
	});
	
	it("must convert several items into a path with a group and channels", function() {
		expect(path.toVerbose(["a-group", "a-channel"]))
		.to.deep.equal(["group", "a-group", "channel", "a-channel"]);
	});
	
	it("must convert several items into a path with a group and channels (deeper)", function() {
		expect(path.toVerbose(["a-group", "channel1", "channel2"]))
		.to.deep.equal(["group", "a-group", "channel", "channel1", "channel", "channel2"]);
	});
	
	it("must convert a path with only a group to just the group name", function() {
		expect(path.toSimple(["group", "a-group"]))
		.to.deep.equal(["a-group"]);
	});
	
	it("must convert a path with a group and a channel to just the two names", function() {
		expect(path.toSimple(["group", "a-group", "channel", "a-channel"]))
		.to.deep.equal(["a-group", "a-channel"]);
	});
	
	it("must convert a path with a group and channels to just the names", function() {
		expect(path.toSimple(["group", "a-group", "channel", "a-channel", "channel", "another-channel"]))
		.to.deep.equal(["a-group", "a-channel", "another-channel"]);
	});
	
	it("must return an empty string on an empty list", function() {
		expect(path.toString([]))
		.to.equal("");
	});
	
	it("must return a properly formatted string for a single group", function() {
		expect(path.toString(["a-group"]))
		.to.equal("a-group/");
	});
	
	it("must return a formatted string on an list of channels", function() {
		expect(path.toString(["a-group", "a-channel"]))
		.to.equal("a-group/a-channel/");
	});
	
	it("must return a formatted string on an list of channels (deeper)", function() {
		expect(path.toString(["a-group", "a-channel", "channel2"]))
		.to.equal("a-group/a-channel/channel2/");
	});
	
	it("must explode a single group into a single group", function() {
		expect(path.explodeWaypoints(["a-group"]))
		.to.deep.equal([["a-group"]]);
	});
	
	it("must explode a group with a channel into a single group, plus the group and channel", function() {
		expect(path.explodeWaypoints(["a-group", "a-channel"]))
		.to.deep.equal([["a-group"], ["a-group", "a-channel"]]);
	});
	
	it("must explode a group with two channels into all three waypoint paths", function() {
		expect(path.explodeWaypoints(["a-group", "a-channel", "another"]))
		.to.deep.equal([["a-group"], ["a-group", "a-channel"], ["a-group", "a-channel", "another"]]);
	});
});