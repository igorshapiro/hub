module.exports = function(options) {
  var _ = require('underscore');

  options = options || {};
  this.manifest = options.manifest || {};
  this.subscribe = this.manifest.subscribe || [];
  this.publish = this.manifest.publish || [];
  this.endpoint = this.manifest.endpoint;
  this.repo = this.manifest.repo;
  this.name = this.manifest.name;

  // Queue names
  this.out_queue = this.name + "_out";
  this.in_queue = this.name + "_in";
  this.dead_collection = this.name + "_dead";

  var self = this;

  this.isSubscriber = function(messageType) {
    return _.some(this.subscribe, function(x) { return x == messageType; });
  };

  this.getMessageEndpoint = function(msg) {
    return this.endpoint
      .replace(':env', msg.env)
      .replace(':message_type', msg.type);
  };

  this.isPublishing = function(type) {
    return _.some(this.publish, function(x) { return x == type; });
  };
};
