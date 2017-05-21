var mocha = require("mocha");
var chai = require("chai");
var expect = chai.expect;
var counter = require("../../index");
var utils = require("../../utils");

beforeEach(function() {
  counter.maxTimespan = 300;
  counter.clear();
});

describe("Listener", function() {
  describe("defaults", function() {
    var activeListener = counter.listen();
    it("should return a function when initially invoked", function() {
      expect(activeListener).to.be.a("function");
    });
    it("should add a hit every time it is invoked if no paths were passed in", function() {
      expect(counter.getHits(1)).to.equal(0);
      activeListener({_parsedUrl: {pathname: "/foo"}},{}, function(){});
      expect(counter.getHits(1)).to.equal(1);
      activeListener({_parsedUrl: {pathname: "/bar"}},{}, function(){});
      expect(counter.getHits(1)).to.equal(2);
    });
  });
  describe("configuration", function() {
    var activeListener = counter.listen(["/hit"]);
    it("should filter out requests that aren not hits", function() {
      expect(counter.getHits(1)).to.equal(0);
      activeListener({_parsedUrl: {pathname: "/hit"}},{}, function(){});
      expect(counter.getHits(1)).to.equal(1);
      activeListener({_parsedUrl: {pathname: "/not/hit"}},{}, function(){});
      expect(counter.getHits(1)).to.equal(1);
    });
  });
  describe("behavior", function() {
    var activeListener = counter.listen();
    it("should return hits that are within the specified cutoff", function() {
      var times = utils.makeTimestamps([290,220,200,180,150,120,100,50,1]);
      counter._hits = times;
      expect(counter.getHits(190)).to.equal(6);
      activeListener({_parsedUrl: {pathname: "/hit"}},{}, function(){});
      expect(counter._hits.length).to.equal(10);
      expect(counter.getHits(190)).to.equal(7);
    });
    it("should clean up hits if the oldest hit is within the maxTimespan", function() {
      var times = utils.makeTimestamps([500,450,400,350,299,220,200,180,150,120,100,50,1]);
      counter._hits = times;
      activeListener({_parsedUrl: {pathname: "/hit"}},{}, function(){});
      expect(counter._hits.length).to.equal(10);
      expect(counter.getHits(160)).to.equal(6);
    });
  });
});
