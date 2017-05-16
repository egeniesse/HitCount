var mocha = require("mocha");
var chai = require("chai");
var expect = chai.expect;
var { HitLogger, getTimesAfterCutoff, getMinutesAgo } = require("../src/hitLogger");

describe("hitLogger", () => {
  it("should be an instance of HitLogger", () => {
    expect(hitLogger).to.be.an.instanceof(HitLogger);
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
  let times = [36,26,23,17,16,15,13,12,5,4,3,2,1].map((num) => {
    return getMinutesAgo(num, now);
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

