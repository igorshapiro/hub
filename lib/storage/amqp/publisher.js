module.exports = function(channel) {
  this.enqueue = function(queue, message) {
    var json = JSON.stringify(message);
    return channel.sendToQueue(queue, new Buffer(json));
  };
};
