var when = require('when');
var initializedServices = {};

module.exports = function(connection) {
  var self = this;

  this.setupService = function(service) {
    var key = service.name;
    if (initializedServices[key]) return connection;

    var channel = null;
    return when(connection)
      .then(function(con) { return con.createChannel(); })
      .then(function(ch) {
        channel = ch;
        return when.all([
          channel.assertQueue(service.in_queue),
          channel.assertQueue(service.out_queue)
        ]);
      })
      .then(function() {
        if (global.ENV === 'test') {
          return when.all([
            channel.purgeQueue(service.in_queue),
            channel.purgeQueue(service.out_queue)
          ]);
        }
        return true;
      })
      .then(function() {
        channel.close();
      })
      .yield(connection);
  };
};
