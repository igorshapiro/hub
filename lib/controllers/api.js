module.exports = function(repo) {
  var request = require('request');

  this.send = function(req, res) {
    var msg = req.body;
    var subscribers = repo.getSubscribers(msg.type)
    for (var s in subscribers) {
      var subscriber = subscribers[s];
      var endpoint = subscriber.getMessageEndpoint(msg);
      request.post({uri: endpoint, json: msg}, function(err, res, body) {
        if (err) throw err;
      });
    }
    res.status(200).end();
  }
}
