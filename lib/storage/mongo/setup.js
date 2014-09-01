module.exports = function(connection) {
  var when = require('when');

  this.setupService = function(service) {
    if (global.ENV !== 'test') return when(connection);
    return when.promise(function(resolve, reject, notify) {
      connection.collection(service.dead_collection).drop(function(err) {
        if (err) console.warn("Collection wasn't dropped", err);
        resolve(connection);
      });
    });
  };
};
