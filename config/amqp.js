/* jshint eqnull: true */

var amqp = require('amqplib');
var when = require('when');
var connection = null;
var UnitOfWork = require('../lib/unit_of_work.js');
var events = require("events");
var util = require('util');

function AMQP(service) {
  var connectionString = service.amqp_url || "amqp://localhost",
      publisher = null,
      consumer = null,
      connection = null;

  function init() {
    var d = when.defer();
    amqp.connect(connectionString)
      .then(function(con) {
        connection = con;
        return when.all([con.createChannel(), con.createChannel()]);
      })
      .then(function(channels) {
        publisher = channels[0];
        consumer = channels[1];
        return when.all([
          publisher.assertQueue(service.in_queue),
          publisher.assertQueue(service.out_queue)
        ]);
      })
      .then(function() {
        if (ENV == 'test') {
          return when.all([
            publisher.purgeQueue(service.in_queue),
            publisher.purgeQueue(service.out_queue)
          ]);
        }
      })
      .catch(console.error)
      .done(function() {
        d.resolve();
      });
    return d.promise;
  }
  var initialized = init();

  this.enqueue = function(q, msg) {
    return when(initialized).then(function() {
      return publisher.sendToQueue(q, new Buffer(JSON.stringify(msg)));
    });
  };

  this.listen = function(q, messageHandler) {
    when(initialized)
      .then(function() {
        consumer.consume(q, function(msg) {
          var uow = new UnitOfWork({message: msg, consumer: consumer});
          messageHandler(uow);
        });
      });
  };
  
  this.close = function() {
    return connection.close();
  };
}

util.inherits(AMQP, events.EventEmitter);

module.exports = AMQP;
