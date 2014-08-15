var cluster = require('cluster');

if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
}
else {
  var express = require('express');
  var app = express();
  app.get('/', function(req, res) {
    // res.send("{a: 1}");  // 10700
    // res.json({a: 1});    // 10700       11ms
    // res.end("");
    // res.end("{a: 1}");   // 18000
    res.end(JSON.stringify({a: 1}));  // 17000
  });
  app.listen(8080);
}
