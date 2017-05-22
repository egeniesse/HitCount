# HitCount - Simple way to count server requests

[![CircleCI](https://circleci.com/gh/egeniesse/HitCount.svg?style=svg)](https://circleci.com/gh/egeniesse/HitCount)


## Installation

```bash
$ npm install --save git+https://github.com/egeniesse/HitCount.git
```

## API

```js
var counter = require("hitcounter");
```
The counter object exposes properties to count hits using middleware, or manually managing the count.

### counter.maxTimespan
How long to retain hit information (seconds)

### counter.listen(paths)
Returns middleware that counts hits to the specified paths
#### paths (Array) REQUIRED
Specify which paths to count as hits

### counter.addHit(tag)
Adds a hit to the count
#### Tag (String) OPTIONAL
Adds a hit to the tag count in addition to the total count

### counter.getHits(seconds, tag)
Returns the number of hits to api endpoints
#### Seconds (Number) REQUIRED
Set the timeframe for hits to get back
#### Tag (String) OPTIONAL
Returns hits to endpoints that have the passed in tag

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

### Tracking hits to multiple endpoints

```js
var counter = require("hitcounter");
var express = require("express");
var app = express();

// set up the listener to listen to multiple endpoints
app.use(counter.listen(["/v1/app", "/v2/app"]));

app.get("/v1/app", function(req, res) {
  res.send("This is a hit for /v1/app");
});

app.get("/v2/app", function(req, res) {
  res.send("This is a hit for /v2/app");
});

// set up the endpoint we are designating to retrieve hit counts
app.get("/hits", function(req, res) {
  var tag = req.query.tag;
  var seconds = req.query.seconds
  var hits = counter.getHits(seconds, tag);
  res.send("There have been " + hits + " so far!");
});

// start the server
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```
