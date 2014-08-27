var UOW = require("./../unit_of_work.js");
var debug = require('./../../debug.js');

module.exports = function(channel, service, queue, handler) {
  this.listen = function() {
    channel.consume(queue, function(rawMessage) {
      var message = JSON.parse(rawMessage.content.toString());
      var uow = new UOW({service: service, message: message});
      handler(uow)
        .catch(function(err) {
          uow.fail(err);
        })
        .done(function() {
          channel.ack(rawMessage);
        }, debug.showError);
    });
  };
};
