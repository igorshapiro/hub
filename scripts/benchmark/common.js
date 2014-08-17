var request = require('request');
var serviceHubUrl = "http://localhost:8020/api/v1/messages";

exports.publish = function publish(msg, callback) {
  request.post({uri: serviceHubUrl, json: msg}, function(err, res, body) {
    // if (err) throw err;
    callback();
  });
};

exports.eventHandler = function(route, handler) {
  var express = require('express');
  var app = express();
  var port = parseInt(process.env.PORT);

  app.post(route, function(req, res) {
    handler(req, res, function() {
      res.end("", 200);
    });
  });
  app.listen(port, function() {
    console.log("Listening on port ", port);
  });
};
