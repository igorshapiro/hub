var when = require('when');

function Pool(Resource) {
  var cache = {};

  this.get = function(params) {
    var resource = new Resource(params);
    var name = resource.getName(params);
    if (!cache[name]) {
      cache[name] = resource.create(params);
    }
    var result = cache[name];
    if (resource.afterResolve) result = result.then(resource.afterResolve);
    return result;
  };

  this.closeAll = function() {
    return when.map(cache, function(item) {
      return item.close();
    });
  };
}

function AMQPConnectionResource(service) {
  var AMQP = require('amqplib');
  var Setup = require('./storage/amqp/setup.js');

  this.getName = function() { return service.connectionString; };
  this.afterResolve = function(con) {
    return new Setup(con).setupService(service);
  };
  this.create = function() { return AMQP.connect(service.connectionString); };
}

var amqpConnectionsPool = new Pool(AMQPConnectionResource);

function PublishersResource(service) {
  var Publisher = require('./storage/amqp/publisher.js');

  this.getName = function() { return service.connectionString; };

  this.create = function() {
    return amqpConnectionsPool.get(service)
      .then(function(con) { return con.createChannel(); })
      .then(function(channel) {
        return new Publisher(channel);
      });
  };
}

function ConsumersResource(params) {
  var Consumer = require('./storage/amqp/consumer.js');

  var service = params.service;
  var queue = params.queue;
  var handler = params.handler;

  this.getName = function() { return service.name + "/" + queue; };

  this.create = function() {
    return amqpConnectionsPool.get(service)
      .then(function(con) { return con.createChannel(); })
      .then(function(channel) {
        return new Consumer(channel, service, queue, handler)
          .listen();
      });
  };
}

function DeadStorageResource(service) {
  var mongojs = require('mongojs');

  this.getName = function() { return service.name; };

  this.create = function() {
    var deadMessageStorage = service.deadStorage || {};
    return when.promise(function(resolve, reject, notify) {
      resolve(mongojs(service.deadStorage || "localhost/servicehub"));
    });
  };
}

exports.reset = function() {
  exports.deadStorage = {};
  exports.publishers = {};
  exports.consumers = {};
};

exports.deadStorage = new Pool(DeadStorageResource);
exports.publishers = new Pool(PublishersResource);
exports.consumers = new Pool(ConsumersResource);
