var mocha = require("mocha");
var chai = require("chai");
var expect = chai.expect;
var utils = require("../../utils");
var counter = require("../../index");

// reset the counter before each scenario
beforeEach(function() {
  counter.maxTimespan = 300;
  counter.clear();
});

describe("HitCounter", function() {
  var now = utils.newTimestamp();

  describe("defaults", function() {
    it("should have a default maxTimespan of 300 seconds", function() {
      expect(counter.maxTimespan).to.equal(300);
    });
  });
  
  describe("update", function() {
    it("should be able to update the maxTimespan", function() {
      counter.maxTimespan = 500;
      var times = utils.makeTimestamps([500,450,400,350,299,220,200,180,150,120,100,50,1], now);
      counter._hits = times;
      expect(counter.maxTimespan).to.equal(500);
      expect(counter.getHits(452)).to.equal(12);
      counter.addHit();
      expect(counter._hits.length).to.equal(14);
    });
  });

  describe("clear", function() {
    it("should clear out all of the stored hits", function() {
      var times = utils.makeTimestamps([500,450,400,350,299,220,200,180,150,120,100,50,1]);
      counter._hits = times; 
      expect(counter._hits.length).to.equal(13);
      counter.clear();
      expect(counter._hits.length).to.equal(0);
    });
  });

  describe("addHit", function() {
    it("should be able to store timestamps in the hits array", function() {
      counter.addHit();
      expect(counter._hits.length).to.equal(1);
    });
    it("should be able to tag hits", function() {
      counter.addHit("test");
      expect(counter._hits[0]).to.have.property("test");
      expect(counter._hits[0].test).to.equal(1);
      expect(counter._hits[0].total).to.equal(1);
    });
    it("should clean up hits that are older than the maxTimespan", function() {
      var times = utils.makeTimestamps([500,450,400,350,290,220,200,180,150,120,100,50,1], now);
      counter._hits = times;
      expect(counter._hits.length).to.equal(13);
      counter.addHit();
      expect(counter._hits.length).to.equal(10);
    });
  });

  describe("getHits", function() {
    it("should return hits that are within the specified cutoff", function() {
      var times = utils.makeTimestamps([500,450,400,350,299,220,200,180,150,120,100,50,1], now);
      counter._hits = times;
      expect(counter.getHits(240)).to.equal(8);
      expect(counter.getHits(190)).to.equal(6);
    });
    it("should return hits that share the same tag", function() {
      counter.addHit("tag1");
      counter.addHit("tag2");
      expect(counter.getHits(2, "tag1")).to.equal(1);
      expect(counter.getHits(2)).to.equal(2);
    });
    it("should throw an error if the request is beyond the maxTimespan", function() {
      try {
        var hits = counter.getHits(301);
        expect(true).to.equal(false);
      }
      catch(err) {
        expect(err).to.equal("The timeframe is beyond the supported limit");
      }
    });
    it("should throw an error if the request not a number", function() {
      try {
        var hits = counter.getHits("string");
        expect(true).to.equal(false);
      }
      catch(err) {
        expect(err).to.equal("The timeframe in is not a number");
      }
    });
    it("should throw an error if the request is less than 0", function() {
      try {
        var hits = counter.getHits(-1);
        expect(true).to.equal(false);
      }
      catch(err) {
        expect(err).to.equal("The timeframe needs to be greater than or equal to 0");
      }
    });
  });
});

