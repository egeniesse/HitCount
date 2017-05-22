# HitCounter - Simple way to count express server requests

[![CircleCI](https://circleci.com/gh/egeniesse/HitCount.svg?style=svg)](https://circleci.com/gh/egeniesse/HitCount)


## Installation

```bash
$ npm install --save git+https://github.com/egeniesse/HitCounter.git
```

## API

```js
var counter = require("hitcounter");
```
The counter object exposes properties to count hits using middleware, or manually managing the count.

### counter.maxTimespan
How long to retain hit information (seconds)

### counter.listen(paths)
Returns middleware that counts hits to the server
#### paths (Array)
Specify which paths to count as hits

### counter.getHits(seconds)
#### Seconds (Number)
Set the timeframe for hits to get back

### counter.addHit()
Adds a hit record to the counter

### counter.clear()
Clears out all of the stored hit records

## Examples

### Using counter as Express middleware

```js
var counter = require("hitcounter");
var express = require("express");
var app = express();

// initialize the middleware specifying the paths with config
app.use(counter.listen(["/app"]));

// set up a route to log hits
app.get("/app", function(req, res) {
  res.send("This is a hit");
});

// set up a route that doesn't count towards the hit count
app.get("/data", function(req, res) {
  res.send("This is not a hit");
});

// set up the endpoint we are designating to retrieve hit counts
app.get("/hits", function(req, res) {
  var hits = counter.getHits(req.query.seconds);
  res.send("There have been " + hits + " so far!");
});

// start the server
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

### Using counter to manually count hits

```js
var counter = require("hitcounter");
var express = require("express");
var app = express();

// set up a route to log hits
app.get("/app", function(req, res) {
  // manually add a hit when this path is called
  counter.addHit()
  res.send("This is a hit");
});

// set up the endpoint we are designating to retrieve hit counts
app.get("/hits", function(req, res) {
  var hits = counter.getHits(req.query.seconds);
  res.send("There have been " + hits + " so far!");
});

// start the server
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```
