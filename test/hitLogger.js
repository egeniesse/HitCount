var mocha = require("mocha");
var chai = require("chai");
var expect = chai.expect;
var logger = require("../src/hitLogger");
var getTimesAfterCutoff = logger.getTimesAfterCutoff;
var utils = require("../src/utils")
var HitLogger = logger.HitLogger;
var hitLogger = new HitLogger();

beforeEach(function() {
  hitLogger.clear();
});

describe("HitLogger", function() {
  var now = new Date().getTime();

  describe("defaults", function() {
    it("should have a default maxTimespan of 5 minutes", function() {
      expect(hitLogger.maxTimespan).to.equal(5);
    });
    it("should have a default cleanFrequency of 1 minute", function() {
      expect(hitLogger.cleanFrequency).to.equal(1);
    });
  });

  describe("clear", function() {
    it("should clear out all of the stored hits", function() {
      var times = utils.makeTimestamps([4,3,2,1]);
      hitLogger.hits = times; 
      expect(hitLogger.hits.length).to.equal(4)
      hitLogger.clear()
      expect(hitLogger.hits.length).to.equal(0)
    })
  });

  describe("addHit", function() {
    it("should be able to store timestamps in the hits array", function() {
      [1,2,3].forEach(function() {
        hitLogger.addHit()
      })
      expect(hitLogger.hits.length).to.equal(3);
    })

    it("should clean up hits that are older than the max timespan", function() {
      var times = utils.makeTimestamps([36,26,23,17,16,15,13,12,5,4,3,2,1], now);
      hitLogger.hits = times;
      expect(hitLogger.hits.length).to.equal(13);
      hitLogger.addHit();
      expect(hitLogger.hits.length).to.equal(5);
    });

    it("should not clean up hits if the oldest hit is within the cleanFrequency plus maxTimespan", function() {
      var times = utils.makeTimestamps([5.5,4,3,2,1,0], now);
      hitLogger.hits = times;
      expect(hitLogger.hits.length).to.equal(6);
      hitLogger.addHit();
      expect(hitLogger.hits.length).to.equal(7);
    });
  });

  describe("getHits", function() {
    it("should return hits that are within the specified cutoff", function() {
      var times = utils.makeTimestamps([6,5,4.5,4,3.3,2,1], now);
      hitLogger.hits = times;
      expect(hitLogger.getHits(3.7)).to.equal(3)
      expect(hitLogger.getHits(4.7)).to.equal(5)
    });
    it("should throw an error if the request is beyond the supported timespan", function() {
      try {
        var hits = hitLogger.getHits(6);
        expect(true).to.equal(false)
      }
      catch(err) {
        expect(err.detail).to.equal("BAD_REQUEST");
        expect(err.code).to.equal(400);
        expect(err.message).to.equal("The request is beyond the supported timespan");
      }
    });
  });
});

describe("getMinutesAgo", function() {
  var now = new Date().getTime();

  it("should return a timestamp when one was not passed in", function() {
    expect(utils.getMinutesAgo(0)).to.be.above(now);
    expect(utils.getMinutesAgo(2)).to.be.below(now);
  });

  it("should return a timestamp reflecting how many minutes ago were passed in", function() {
    expect(utils.getMinutesAgo(0, now)).to.equal(now);
    expect(utils.getMinutesAgo(3, now)).to.be.below(now);
    expect(utils.getMinutesAgo(10, now)).to.equal(now-(10*60*1000));
  });
});

describe("getTimesAfterCutoff", function() {
  var now = new Date().getTime();
  var times = utils.makeTimestamps([36,26,23,17,16,15,13,12,5,4,3,2,1], now);

  it("should return the full array if the cutoff is before the first element", function() {
    var cutoff = utils.getMinutesAgo(44);
    var cutoffTimes = getTimesAfterCutoff(times, cutoff);
    expect(cutoffTimes.length).to.equal(13);
    expect(cutoffTimes).to.deep.equal(times);
  });

  it("should remove numbers in a sorted array that are less than the cutoff number", function() {
    var cutoff = utils.getMinutesAgo(14, now);
    var cutoffTimes = getTimesAfterCutoff(times, cutoff);
    expect(cutoffTimes.length).to.equal(7);
    expect(cutoffTimes).to.deep.equal(times.slice(6));
  });

  it("should return an empty array if there are no numbers less than the cutoff number", function() {
    var cutoff = utils.getMinutesAgo(0, now);
    var cutoffTimes = getTimesAfterCutoff(times, cutoff);
    expect(cutoffTimes.length).to.equal(0);
    expect(cutoffTimes).to.deep.equal([]);
  });

  it("should return the entire array if no cutoff was specified", function() {
    var cutoffTimes = getTimesAfterCutoff(times);
    expect(cutoffTimes.length).to.equal(13);
    expect(cutoffTimes).to.deep.equal(times);
  });

  it("should return an empty array if an empty array was passed in", function() {
    var cutoffTimes = getTimesAfterCutoff([]);
    expect(cutoffTimes.length).to.equal(0);
    expect(cutoffTimes).to.deep.equal([]);
  });

  it("should return an empty array if nothing was passed in", function() {
    var cutoffTimes = getTimesAfterCutoff();
    expect(cutoffTimes.length).to.equal(0);
    expect(cutoffTimes).to.deep.equal([]);
  });
});

