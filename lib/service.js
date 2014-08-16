module.exports = function(options) {
  var request = require('request');

  options = options || {};
  this.manifest = options.manifest || {};
  this.subscribe = this.manifest.subscribe || [];
  this.publish = this.manifest.publish || [];
  this.endpoint = this.manifest.endpoint;

  this.isSubscriber = function(messageType) {
    for (var s in this.subscribe) {
      if (messageType == this.subscribe[s]) return true;
    }
    return false;
  };

  this.getMessageEndpoint = function(msg) {
    return this.endpoint
      .replace(':env', msg.env)
      .replace(':message_type', msg.type);
  };

  this.process = function(msg) {
    var endpoint = this.getMessageEndpoint(msg);
    request.post({uri: endpoint, json: msg}, function(err, res, body) {
      if (err) throw err;
    });
  };
};
