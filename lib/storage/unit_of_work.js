module.exports = function(options) {
  var pool = require('../resource_pool.js');

  if (!options.service) throw new Error("Missing `service`");
  if (!options.message) throw new Error("Missing `message`");

  var message = this.message = options.message;
  var service = this.service = options.service;
  var self = this;

  function kill() {
    return pool.deadStorage.get(service)
      .then(function(storage) {
        // console.log
        return storage.append(self.message);
      });
  }

  function retry() {
    return pool.publishers.get(service)
      .then(function(publisher) {
        publisher.enqueue(service.in_queue, message);
      });
  }

  function canRetry() {
    var maxAttempts = self.message.max_attempts || 5;
    return maxAttempts > self.message.attempts;
  }

  this.fail = function(reason) {
    self.message.attempts = (self.message.attempts || 0) + 1;
    if (canRetry()) return retry();
    return kill();
  };

  this.succeed = function() {
    service.succeed();
  };
};
