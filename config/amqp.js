/* jshint eqnull: true */

var amqp = require('amqplib');
var when = require('when');
var connections = {};
var UnitOfWork = require('../lib/unit_of_work.js');

module.exports = function(service) {
  this.getConnection = function() {
    var d = when.defer();
    // if there's no connection for the service - create a new one
    if (connections[service.name] == null) {
      var connectionString = service.amqp_url || "amqp://localhost";
      connections[service.name] = amqp.connect(connectionString)
        .then(this.setup)
        .then(function(con) {
          connections[service.name] = con;
          return con;
        })
        .done(d.resolve);
    }
    // If there's a promise for the connection - return it
    else if (connections[service.name].then){
      return connections[service.name];
    }
    // Otherwise resolve the promise with the cached connection
    else {
      d.resolve(connections[service.name]);
    }
    return d.promise;
  };

  this.setup = function(con) {
    var channel = null;
    return con.createChannel()
      .then(function(ch) {
        channel = ch;
        return when.all([
          ch.assertQueue(service.name + "_in"),
          ch.assertQueue(service.name + "_out"),
        ]);
      })
      .then(function() { channel.close(); })
      .then(function() { return con; });
  };

  this.getPublisher = function() {
    var d = when.defer();
    this.getConnection()
      .then(function(con) {
        con.createChannel().then(d.resolve);
      });
    return d.promise;
  };

  this.getConsumer = function() {
    var d = when.defer();
    this.getConnection()
      .then(function(con) {
        con.createChannel().then(d.resolve);
      });
    return d.promise;
  };

  this.enqueue = function(q, msg) {
    this.getPublisher()
      .then(function(publisher) {
        publisher.sendToQueue(q, new Buffer(JSON.stringify(msg)));
      });
  };

  this.dequeue = function(q) {
    var d = when.defer();
    this.getConsumer()
      .then(function(consumer) {
        consumer.consume(q, function(msg) {
          d.resolve(new UnitOfWork({message: msg, consumer: consumer}));
        });
      });
    return d.promise;
  };
};
