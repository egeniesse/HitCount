var mocha = require("mocha");
var chai = require("chai");
var expect = chai.expect;
var qs = require("querystring");
var request = require("request-promise");

beforeEach(function() {
  return fetch("DELETE", "/api/hits");
});

describe("Sample API", function() {
  it("should not count hits when calling the specified endpoints", function() {
    return sendRequests(4, "/api/data").then(function(){
      return fetch("GET", "/api/hits", { seconds: 5 }).then(function(res) {
        expect(res.message).to.equal(0);
      });
    });
  });
  it("should be able to count hits", function() {
    return sendRequests(2, "/v1/app").then(function(){
      return fetch("GET", "/api/hits", { seconds: 5 }).then(function(res) {
        expect(res.message).to.equal(2);
      });
    });
  });
  it("should be able to count hits on all paths specified", function() {
    return sendRequests(2, "/v1/app").then(function(){
      return sendRequests(3, "/v2/app").then(function(){
        return fetch("GET", "/api/hits", { seconds: 5 }).then(function(res) {
          expect(res.message).to.equal(5);
        });
      });
    });
  });
  it("should be able to clear its hits", function() {
    return sendRequests(4, "/v1/app").then(function() {
      return fetch("GET", "/api/hits", { seconds: 5 }).then(function(res) {
        expect(res.message).to.equal(4);
        return fetch("DELETE", "/api/hits").then(function() {
          return fetch("GET", "/api/hits", { seconds: 5 }).then(function(res) {
            expect(res.message).to.equal(0);
          });
        });
      });
    });
  });
  it("should not count hits that happened beyond the inputted timeframe", function() {
    return fetch("GET", "/v1/app").then(function() {
      return wait(1500).then(function() {
        return fetch("GET", "/api/hits", { seconds: 1 }).then(function(res) {
          expect(res.message).to.equal(0);
          return fetch("GET", "/api/hits", { seconds: 5 }).then(function(res) {
            expect(res.message).to.equal(1);
          });
        });
      });
    }); 
  });
  it("should return an error if the request is a string", function() {
    return fetch("GET", "/api/hits", { seconds: "string" }).then(function(err) {
      expect(err.code).to.equal(400);
      expect(err.message).to.equal("The timeframe in is not a number");
    });
  });
  it("should return an error if the request exceeds the supported timeframe", function() {
    return fetch("GET", "/api/hits", { seconds: 500 }).then(function(err) {
      expect(err.code).to.equal(400);
      expect(err.message).to.equal("The timeframe is beyond the supported limit");
    });
  });
  it("should return an error if the request is less than 0", function() {
    return fetch("GET", "/api/hits", { seconds: -2 }).then(function(err) {
      expect(err.code).to.equal(400);
      expect(err.message).to.equal("The timeframe needs to be greater than 0");
    });
  });
  it("should return an error no parameter was passed in", function() {
    return fetch("GET", "/api/hits").then(function(err) {
      expect(err.code).to.equal(400);
      expect(err.message).to.equal("You must specify a timeframe");
    });
  });
});


function sendRequests(num, path, params) {
  var requests = [];
  for(var i=0; i<num; i++) {
    requests.push(fetch("GET", path, params));
  }
  return Promise.all(requests);
}

function fetch(method, path, params) {
  return request({
    method: method,
    uri: "http://localhost:3000" + path + "?" + qs.stringify(params)
  }).then(JSON.parse);
}

function wait(milliseconds) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, milliseconds);
  });
}