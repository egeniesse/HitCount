function makeTimestamps(minutes, now) {
  now = now || new Date().getTime();
  return minutes.map((minute) => {
    return getMinutesAgo(minute, now);
  });
}

function getMinutesAgo(minutes, now) {
  now = now || new Date().getTime();
  return now - (minutes * 60000);
}

module.exports = {
  makeTimestamps: makeTimestamps,
  getMinutesAgo: getMinutesAgo
};
