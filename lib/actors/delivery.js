module.exports = function(service) {
  var when = require('when');
  var pool = require("./../resource_pool.js");

  function deliverToService(service, message) {
    return pool.publishers.get(service)     // Get publisher for the service
      .then(function(publisher) {
        publisher.enqueue(service.in_queue, message);
      });
  }

  function handler(uow) {
    var msg = uow.message;
    var subscribers = service.repo.getSubscribers(msg.type);

    return when.map(subscribers, function(sub) {
      return deliverToService(sub, msg);
    });
  }

  pool.consumers.get({
    service: service,
    queue: service.out_queue,
    handler: handler
  });
};
