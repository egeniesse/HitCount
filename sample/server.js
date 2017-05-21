var counter = require("../index");
var express = require("express"); 
var app = express();

// update the maxTimespan
counter.maxTimespan = 400;

// init middleware with the paths to count 
app.use(counter.listen(["/v1/app", "/v2/app"]));

// set up a couple of dummy routes to simulate endpoints to hit
app.get("/v1/app", function(req, res) {
  res.json(buildResponse("GOOD_REQUEST", "The app v1 has been served"));
});
app.get("/v2/app", function(req, res) {
  res.json(buildResponse("GOOD_REQUEST", "The app v2 has been served"));
});
app.get("/api/data", function(req, res) {
  res.json(buildResponse("GOOD_REQUEST", "This request is not a hit"));
});

// set up the endpoint we are designating to retrieve hits
app.get("/api/hits", function(req, res) {
  // get the registered hits if the timeframe is supported
  try {
    var timeframe = req.query.seconds;
    var hits = counter.getHits(timeframe);
    res.json(buildResponse("GOOD_REQUEST", hits));
  }
  // if the timeframe isn't supported, send the error
  catch(err) { 
    res.json(buildResponse("BAD_REQUEST", err));
  }
});

// delete the hits from memory
app.delete("/api/hits", function(req, res) {
  counter.clear();
  res.json(buildResponse("GOOD_REQUEST", "The hits have been cleared"));
});

// catch all route returning a 404
app.get("/*", function(req, res) {
  res.json(buildResponse("NOT_FOUND"));
});

// start the server
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// helper to build response objects
function buildResponse(exception, message) {
  var response = responses[exception];
  if(message !== undefined) {
    response.message = message;
  }
  return response;
}

var responses = {
  NOT_FOUND: { code: 404, message: "Not Found" },
  BAD_REQUEST: { code: 400, message: "Bad Request" },
  GOOD_REQUEST: { code: 200, message: "Good Request" }
};
