module.exports = function(service) {
  var pool = require("./../resource_pool.js");
  var when = require('when');
  var request = require('request');

  function handler(uow) {
    var message = uow.message;
    var endpoint = service.getMessageEndpoint(message);
    return when.promise(function(resolve, reject, notify) {
      request.post({uri: endpoint, json: message}, function(err, res, body) {
        if (err) {
          reject({error: err});
          return;
        }
        var category = parseInt(res.statusCode) / 100;
        var failed = category == 4 || category == 5;
        if (failed) {
          reject({error: category, response: res, body: body});
          return;
        }
        resolve();
      });
    });
  }

  pool.consumers.get({
    service: service,
    queue: service.in_queue,
    handler: handler
  });
};
