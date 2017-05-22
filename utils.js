// takes an array of numbers and returns an array of timestamps, each being that
// number of seconds ago
function makeTimestamps(seconds, now) {
  now = now || newTimestamp();
  return seconds.map(function(second) {
    return {
      time: now - second,
      hits: 1
    };
  });
}

// returns a new timestamp accurate to the second rather than millisecond
function newTimestamp() {
  var now = new Date().getTime();
  return Math.floor(now / 1000);
}

module.exports = {
  newTimestamp: newTimestamp,
  makeTimestamps: makeTimestamps
};
