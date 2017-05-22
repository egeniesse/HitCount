var utils = require("./utils");

/*
 * Attributes:
 *  _hits Array: an array used to store the hit timestamps
 *  maxTimespan Number: The supported timeframe (in seconds) of hits we are storing 
 *
 * Implementation Design:
 *  A quick overview on about how I'm storing hit count data and why I'm doing it this way.
 *  Data Structure:
 *    I am storing hits using an array of javascript objects that represent 1 second windows. 
 *    Properties:
 *      time: the unix timestamp (floored to the previous second).
 *      total: the total number of hits.
 *      <tag>: the total number of hits for the tag.
 *    Benefits:
 *      - Memory Scales Well: The memory usage is relatively small and consistent regardless of 
 *        demand ( 5 minutes of 64-bit unix timestamps at 1 million requests per second ~ 1.2 GB ).
 *      - Memory Management: Old records only need to be deleted once every second (worst case).
 *      - Extendable: can store additional data (ex. tag information, requestor information...).
 *     Limitations:
 *      - Accuracy: It is only accurate to the second. All of the millisecond data is lost.
 *  Data Storage:
 *    The data is stored in-memory in a javascript array.
 *    Benefits:
 *      - Pretty Efficient: Writes are O(1), getting and deleting hits are O(n) "n" is the maxTimeframe.
 *    Limitations:
 *      - Getting and Deleting Hits: If maxTimeframe becomes a huge number, gets and deletes get pretty expensive.
 */

function HitCounter() {
  this._hits = [];
  this.maxTimespan = 300;
}

/*
 * addHit: Adds a hit object to the hits array. Removing hit objects from the array if 
 * there is are any that are older the allowed threshold 
 */

HitCounter.prototype.addHit = function(tag) {
  var now = utils.newTimestamp();
  // if this is the first hit, or the timestamp is greater than the last time, insert a new hit
  if(!this._hits.length || this._hits[this._hits.length-1].time < now) {
    this._hits.push({ time: now, total: 0 });
  }
  var hitCount = this._hits[this._hits.length-1];
  // if a tag was passed in, add the prop if it doesn't exist and increment the count
  if(tag !== undefined) {
    hitCount[tag] = hitCount[tag] || 0;
    hitCount[tag]++;
  }
  // increment the total hits
  hitCount.total++;
  // if the oldest timestamp is beyond the allowed threshold
  var cutoff = now - this.maxTimespan;
  if(this._hits[0].time < cutoff) {
    // return a new array with only the values within the cutoff
    this._hits = this._hits.filter(function(hit) {
      return hit.time >= cutoff;
    });
  }
};

/*
 * getHits: Class method that returns the number of hits that happened between now
 * and a specified number of seconds ago
 * Arguments:
 *  seconds Number: The time limit of hits we are getting
 * Return:
 *  hits Number: The number of hits that happened in that timeframe
 */

HitCounter.prototype.getHits = function(seconds, tag) {
  if(seconds === undefined) {
    throw "You must specify a timeframe";
  }
  if(isNaN(seconds)) {
    throw "The timeframe in is not a number";
  }
  if(seconds > this.maxTimespan) {
    throw "The timeframe is beyond the supported limit";
  }
  if(seconds < 0) {
    throw "The timeframe needs to be greater than or equal to 0";
  }
  var now = utils.newTimestamp();
  var cutoff = now - seconds;
  // if no tag has been passed in, default to total
  tag = tag || "total";
  // reduce the _hits array only tallying the hits to a tag within the cutoff
  return this._hits.reduce(function(total, hit) {
    if(hit.time >= cutoff && hit[tag]) {
      total += hit[tag];
    }
    return total;
  }, 0);
};

/*
* clear: Empties the hits array
*/
HitCounter.prototype.clear = function() {
  this._hits = [];
};

/*
 * listen: Express middleware that counts requests 
 * Arguments:
 *   paths Array: An array of paths to count as hits 
 * Return:
 *  Function: An express middleware function
 */

HitCounter.prototype.listen = function(paths) {
  if(paths) {
    // initialize a new set for O(1) path lookup
    paths = new Set(paths);
  }
  // returns a function to be used as the middleware
  return function(req, res, next) {
    var path = req._parsedUrl.pathname;
    // if the path was passed in
    if(!paths || paths.has(path)){
      this.addHit(path);
    }
    next();
  }.bind(this);
};

module.exports = new HitCounter();
