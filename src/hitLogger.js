var utils = require("./utils")

class HitLogger {

  constructor() {
    this.hits = [];
    this.maxTimespan = 5;
    this.cleanFrequency = 1;
  }

  addHit() {
    var now = new Date().getTime();
    this.hits.push(now);
    var cleanThreshold = this.maxTimespan + this.cleanFrequency;
    if(this.hits[0] < utils.getMinutesAgo(cleanThreshold, now)) {
      var cutoff = utils.getMinutesAgo(this.maxTimespan, now);
      this.hits = getTimesAfterCutoff(this.hits, cutoff);
    }
  }

  getHits(minutes) {
    if(minutes > this.maxTimespan) {
      throw { 
        detail: "BAD_REQUEST",
        message: "The request is beyond the supported timespan",
        code: 400
      };
    }
    var cutoff = utils.getMinutesAgo(minutes);
    var times = getTimesAfterCutoff(this.hits, cutoff);
    return times.length;
  }

  clear() {
    this.hits = []
  }
}

/*
 * getTimesAfterCutoff: Takes a sorted (ascending) array of unix timestamps and a
 * cutoff timestamp, returns an array of times that are greater than the cutoff timestamp
 * This is done by performing a binary search of the times array to determine the index
 * index of the first timestamp after the cutoff and then slicing the array on that index
 */

function getTimesAfterCutoff(times, cutoff) {
  // if cutoff is not defined or the cutoff is older than the oldest timestamp, return times
  if(!cutoff || times[0] > cutoff) {
    return times || [];
  }

  // if times is an empty array or there are no times after the cutoff return an empty array
  if(times.length === 0 || times[times.length-1] < cutoff) {
    return [];
  }
  
  var centerIndex = Math.floor(times.length/2);
  var leftIndex = 0;
  var rightIndex = times.length-1;

  while(leftIndex !== rightIndex-1) {
    if(cutoff > times[centerIndex]) {
      leftIndex = centerIndex;
    }
    else {
      rightIndex = centerIndex;
    }
    centerIndex = Math.floor((leftIndex + rightIndex)/2);
  }
  // return a new array instance, slicing at the index of the first timestamp after the cutoff
  return times.slice(rightIndex);
}

module.exports = {
  HitLogger: HitLogger,
  getTimesAfterCutoff: getTimesAfterCutoff
};

