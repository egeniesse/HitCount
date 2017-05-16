class HitLogger {

  constructor() {
    this.hits = {};
    this.maxTimespan = 5;
    this.cleanFrequency = 1;
  }

  addHit(key) {
    let now = new Date().getTime();
    let times = this.hits[key] || [];
    times.push(now);
    let cleanThreshold = this.maxTimespan + this.cleanFrequency;
    if(times[0] < _getMinutesAgo(cleanThreshold, now)) {
      let cutoff = _getMinutesAgo(this.maxTimespan, now);
      this.hits[key] = _getTimesAfterCutoff(times, cutoff);
    }
  }

  getHits(minutes, key) {
    if(minutes > this.maxTimespan) {
      return "The request is beyond the supported timespan"
    }
    let times = this.hits[key] || [];
    let cutoff = _getMinutesAgo(minutes)
    times = _getTimesAfterCutoff(times, cutoff);
    return times.length;
  }
}

function _getMinutesAgo(minutes, now) {
  now = now || new Date().getTime();
  return now - (minutes * 60000);
}

/*
 * _getTimesAfterCutoff: When given a sorted (ascending) array of unix times and 
 * cutoff, returns an array of times that are greater than the cutoff timestamp
 * This is done by performing a binary search of the times array to determine the index
 * index of the first timestamp after the cutoff and then slicing the array on that index
 */

function _getTimesAfterCutoff(times, cutoff) {
  // if times is an empty array or there are no times after the cutoff return an empty array
  if(times.length === 0 || times[times.length-1] < cutoff) {
    return [];
  }

  let centerIndex = Math.floor(times.length / 2);
  let leftIndex = 0;
  let rightIndex = times.length-1;

  while(leftIndex !== rightIndex-1) {
    if(cutoff > times[centerIndex]) {
      leftIndex = centerIndex;
    }
    else {
      rightIndex = centerIndex;
    }
    centerIndex = Math.floor((leftIndex + rightIndex)/2);
  }
  // return an array, slicing at first timestamp after the cutoff
  return times.slice(rightIndex);
}

// export a new instance of the Hit logger to use for the app
module.exports = new HitLogger();

