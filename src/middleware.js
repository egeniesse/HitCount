let hitLogger = require("./test");

module.exports = function(opts) {
  let { maxTimespan, cleanFrequency, hitFilter } = opts;
  if(maxTimespan !== undefined) {
    hitLogger.maxTimespan = maxTimespan;
  }
  if(cleanFrequency !== undefined) {
    hitLogger.cleanFrequency = cleanFrequency;
  }
  function(req, res, next) {
    if(!hitFilter || hitFilter(req)) {
      hitLogger.addHit();
    } 
    next();
  }
};
