var mocha = require("mocha");
var chai = require("chai");
var expect = chai.expect;
var { HitLogger, getTimesAfterCutoff, getMinutesAgo } = require("../src/hitLogger");

describe("HitLogger", () => {
  let now = new Date().getTime();

  describe("defaults", () => {
    let hitLogger = new HitLogger()
    it("should have a default maxTimespan of 5 minutes", () => {
      expect(hitLogger.maxTimespan).to.equal(5);
    });
    it("should have a default cleanFrequency of 1 minute", () => {
      expect(hitLogger.cleanFrequency).to.equal(1);
    });
  });

  describe("addHit", () => {
    let hitLogger = new HitLogger()
    it("should be able to store timestamps in the hits array", () => {
      [1,2,3].forEach(() => {
        hitLogger.addHit()
      })
      expect(hitLogger.hits.length).to.equal(3);
    })

    it("should clean up hits that are older than the max timespan", () => {
      let times = makeTimestamps([36,26,23,17,16,15,13,12,5,4,3,2,1], now);
      hitLogger.hits = times;
      expect(hitLogger.hits.length).to.equal(13);
      hitLogger.addHit();
      expect(hitLogger.hits.length).to.equal(5);
    });

    it("should not clean up hits if the oldest hit is within the cleanFrequency plus maxTimespan", () => {
      let times = makeTimestamps([5.5,4,3,2,1,0], now);
      hitLogger.hits = times;
      expect(hitLogger.hits.length).to.equal(6);
      hitLogger.addHit();
      expect(hitLogger.hits.length).to.equal(7);
    });
  });

  describe("getHits", () => {
    let times = makeTimestamps([6,5,4.5,4,3.3,2,1], now);
    let hitLogger = new HitLogger();
    hitLogger.hits = times;
    it("should return hits that are within the specified cutoff", () => {
      expect(hitLogger.getHits(3.7)).to.equal(3)
      expect(hitLogger.getHits(4.7)).to.equal(5)
    });
    it("should throw an error if the request is beyond the supported timespan", () => {
      try {
        let hits = hitLogger.getHits(6);
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

describe("getMinutesAgo", () => {
  let now = new Date().getTime();

  it("should return a timestamp when one was not passed in", () => {
    expect(getMinutesAgo(0)).to.be.above(now);
    expect(getMinutesAgo(2)).to.be.below(now);
  });

  it("should return a timestamp reflecting how many minutes ago were passed in", () => {
    expect(getMinutesAgo(0, now)).to.equal(now);
    expect(getMinutesAgo(3, now)).to.be.below(now);
    expect(getMinutesAgo(10, now)).to.equal(now-(10*60*1000));
  });
});

describe("getTimesAfterCutoff", () => {
  let now = new Date().getTime();
  let times = makeTimestamps([36,26,23,17,16,15,13,12,5,4,3,2,1], now);

  it("should return the full array if the cutoff is before the first element", () => {
    let cutoff = getMinutesAgo(44);
    let cutoffTimes = getTimesAfterCutoff(times, cutoff);
    expect(cutoffTimes.length).to.equal(13);
    expect(cutoffTimes).to.deep.equal(times);
  });

  it("should remove numbers in a sorted array that are less than the cutoff number", () => {
    let cutoff = getMinutesAgo(14, now);
    let cutoffTimes = getTimesAfterCutoff(times, cutoff);
    expect(cutoffTimes.length).to.equal(7);
    expect(cutoffTimes).to.deep.equal(times.slice(6));
  });

  it("should return an empty array if there are no numbers less than the cutoff number", () => {
    let cutoff = getMinutesAgo(0, now);
    let cutoffTimes = getTimesAfterCutoff(times, cutoff);
    expect(cutoffTimes.length).to.equal(0);
    expect(cutoffTimes).to.deep.equal([]);
  });

  it("should return the entire array if no cutoff was specified", () => {
    let cutoffTimes = getTimesAfterCutoff(times);
    expect(cutoffTimes.length).to.equal(13);
    expect(cutoffTimes).to.deep.equal(times);
  });

  it("should return an empty array if an empty array was passed in", () => {
    let cutoffTimes = getTimesAfterCutoff([]);
    expect(cutoffTimes.length).to.equal(0);
    expect(cutoffTimes).to.deep.equal([]);
  });

  it("should return an empty array if nothing was passed in", () => {
    let cutoffTimes = getTimesAfterCutoff();
    expect(cutoffTimes.length).to.equal(0);
    expect(cutoffTimes).to.deep.equal([]);
  });
});

function makeTimestamps(minutes, now) {
  now = now || new Date().getTime();
  return minutes.map((minute) => {
    return getMinutesAgo(minute, now);
  });
}
