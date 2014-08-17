module.exports = function(options) {
  var when = require('when');
  var request = require('request');
  var AMQP = require('../config/amqp.js');
  var _ = require('underscore');
  var Mongo = require('../config/mongo.js');
  var mongo = new Mongo(this);

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

  var state = 'running';
  var self = this;
  var amqp = new AMQP(this);

  function setState(newState) {
    state = newState;
  }

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

  var inProgress = {};
  var terminationPromises = {};
  terminationPromises[this.in_queue] = when.defer();
  terminationPromises[this.out_queue] = when.defer();

  function processQueue(queue, handler) {
    amqp.listen(queue, function(uow){
      inProgress[queue] = (inProgress[queue] || 0) + 1;
      when(handler(uow))
        .done(function() {
          uow.ack();
          inProgress[queue]--;
          if (state === 'stopping' && inProgress[queue] === 0)
            terminationPromises[queue].resolve();
        });
    });
  }

  this.deliverOutgoing = function() {
    processQueue(self.out_queue, function(uow) {
      var msg = uow.message;
      var subscribers = this.repo.getSubscribers(msg.type);
      var enqueues = [];
      for (var s in subscribers) {
        enqueues.push(subscribers[s].enqueueInput(msg));
      }
      return when.all(enqueues);
    });
  };

  this.processInput = function() {
    processQueue(self.in_queue, function(uow) {
      return self.process(uow.message);
    });
  };

  this.process = function(msg) {
    var d = when.defer();
    var endpoint = this.getMessageEndpoint(msg);
    request.post({uri: endpoint, json: msg}, function(err, res, body) {
      if (err) throw err;

      var category = parseInt(res.statusCode) / 100;
      if (category == 4 || category == 5) {
        if (shouldRetry(msg)) {
          self.enqueueInput(msg);
        }
        else {
          mongo.kill(msg);
        }
      }
      d.resolve(msg);
    });
    return d.promise;
  };

  function shouldRetry(msg) {
    var maxAttempts = msg.max_attempts || 5;
    msg.attempts = (msg.attempts || 0) + 1;
    return msg.attempts < maxAttempts;
  }

  this.stop = function() {
    setState('stopping');
    var promises = _.map(terminationPromises, function(x) { return x; });
    return when.all(promises).then(amqp.close);
  };
};
