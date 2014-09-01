var debug = require('../../debug.js');
var when = require('when');
var initializedServices = {};

module.exports = function(connection) {
  var self = this;

  this.setupService = function(service) {
    // Prevent setting up the queues multiple times for the same service
    // (setup will be done only once per process)
    var key = service.name;
    if (initializedServices[key]) return connection;

    var channel = null;
    // initializedServices[key] = when(connection)
    return when(connection)
      // Create temporary channel
      .then(function(con) { return con.createChannel(); })
      // Create the queues
      .then(function(ch) {
        channel = ch;
        return when.all([
          channel.assertQueue(service.in_queue),
          channel.assertQueue(service.out_queue)
        ]);
      })
      // If in test mode - purge the queues
      .then(function() {
        if (global.ENV === 'test') {
          return when.all([
            channel.purgeQueue(service.in_queue),
            channel.purgeQueue(service.out_queue)
          ]);
        }
        return true;
      })
      // Close the channel
      .then(function() {
        channel.close();
      })
      .catch(debug.showError)
      // The method is expected to return the connection
      .yield(connection);
    console.log(initializedServices[key]);
    return initializedServices[key];
  };
};
