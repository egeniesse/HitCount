var HitLogger = require("./src/hitLogger").HitLogger
var hitLogger = new HitLogger()

function listener(opts) {
  opts = opts || {}
  if(opts.maxTimespan !== undefined) {
    hitLogger.maxTimespan = opts.maxTimespan;
  }
  if(opts.cleanFrequency !== undefined) {
    hitLogger.cleanFrequency = opts.cleanFrequency;
  }
  return function(req, res, next) {
    if(!opts.filter || opts.filter(req)) {
      hitLogger.addHit();
    } 
    next();
  }
};

module.exports = {
  listener: listener,
  hitLogger: hitLogger
}
