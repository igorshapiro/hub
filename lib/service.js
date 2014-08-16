module.exports = function(options) {
  var when = require('when');
  var request = require('request');
  var AMQP = require('../config/amqp.js');

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

  var self = this;
  var amqp = new AMQP(this);

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

  this.enqueueOutgoing = function(msg) { amqp.enqueue(this.out_queue, msg); };
  this.dequeueOutgoing = function(msg) { return amqp.dequeue(this.out_queue); };
  this.enqueueInput = function(msg) { amqp.enqueue(this.in_queue, msg); };
  this.dequeueInput = function(msg) { return amqp.dequeue(this.in_queue); };

  this.run = function() {
    this.deliverOutgoing();
    this.processInput();
  };

  this.deliverOutgoing = function() {
    var uow = null;
    amqp.dequeue(self.out_queue)
      .then(function(_uow) {
        uow = _uow;
        var msg = _uow.message;

        var subscribers = this.repo.getSubscribers(msg.type);
        var enqueues = [];
        for (var s in subscribers) {
          enqueues.push(subscribers[s].enqueueInput(msg));
        }
        return when.all(enqueues);
        // return when.reduce(subscribers, function(sub) {
        //   console.log(sub.name, ": ", msg);
        //   sub.enqueueInput(uow.message);
        // });
      })
      .then(function() { uow.ack(); })
      .then(self.deliverOutgoing);
  };

  this.processInput = function() {
    var uow = null;
    amqp.dequeue(self.in_queue)
      .then(function(_uow) {
        uow = _uow;
        self.process(uow.message);
      })
      .then(function() { uow.ack(); })
      .then(self.processInput);
  };

  this.process = function(msg) {
    var d = when.defer();
    var endpoint = this.getMessageEndpoint(msg);
    request.post({uri: endpoint, json: msg}, function(err, res, body) {
      if (err) throw err;
      d.resolve(msg);
    });
    return d.promise;
  };

  this.stop = function() {

  };
};
