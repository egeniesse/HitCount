var mocha = require("mocha");
var chai = require("chai");
var expect = chai.expect;
var listener = require("../index").listener;
var hitLogger = require("../index").hitLogger;
var utils = require("../src/utils");

beforeEach(function() {
  hitLogger.clear();
});

describe("Listener", function() {
  describe("defaults", function() {
    var activeListener = listener();
    it("should return a function when initially invoked", function() {
      expect(activeListener).to.be.a("function");
    });
    it("should add a hit every time it is invoked if no filter function was passed in", function() {
      expect(hitLogger.getHits(1)).to.equal(0);
      activeListener({},{}, function(){}); 
      expect(hitLogger.getHits(1)).to.equal(1);
      activeListener({},{}, function(){}); 
      expect(hitLogger.getHits(1)).to.equal(2);
    });
  });
  describe("configuration", function() {
    var opts = {
      maxTimespan: 10,
      cleanFrequency: 3,
      filter: function(req) {
        return req.isHit;
      }
    };
    var activeListener = listener(opts);
    it("should filter out requests that aren not hits", function() {
      expect(hitLogger.getHits(1)).to.equal(0);
      activeListener({isHit: true},{}, function(){});
      expect(hitLogger.getHits(1)).to.equal(1);
      activeListener({isHit: false},{}, function(){});
      expect(hitLogger.getHits(1)).to.equal(1);
    });
    it("should be able to update the maxTimespan if it is passed in", function() {
      var times = utils.makeTimestamps([36,26,23,17,16,15,13,12,8,5,4,3,2,1]);
      hitLogger.hits = times;
      expect(hitLogger.getHits(10)).to.equal(6);
      activeListener({isHit: true},{}, function(){});
      expect(hitLogger.hits.length).to.equal(7);
      expect(hitLogger.getHits(10)).to.equal(7);
    });
    it("should be able to update the cleanFrequency if it is passed in", function() {
      var times = utils.makeTimestamps([12,8,5,4,3,2,1]);
      hitLogger.hits = times;
      activeListener({isHit: true},{}, function(){});
      expect(hitLogger.hits.length).to.equal(8);
      expect(hitLogger.getHits(10)).to.equal(7);
    });
  });
});
