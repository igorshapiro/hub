module.exports = function(options) {
  var rawMessage = options.message;
  var consumer = options.consumer;

  this.message = JSON.parse(rawMessage.content.toString());

  this.ack = function() {
    consumer.ack(rawMessage);
  };
};
