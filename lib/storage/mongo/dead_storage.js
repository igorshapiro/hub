module.exports = function(service) {
  var pool = require('./../../resource_pool.js');
  var when = require('when');
  var deadCollection = service.dead_collection;

  function exec(callback) {
    return when.promise(function(resolve, reject, notify) {
      pool.mongoConnections.get(service)
        .then(function(con) {
          return callback(con, resolve, reject);
        })
        .done();
    });
  }

  function execWithCollection(col, callback) {
    return exec(function(db, resolve, reject) {
      callback(db.collection(col), resolve, reject);
    });
  }

  this.append = function(msg) {
    return execWithCollection(deadCollection, function(col, resolve, reject) {
        col.insert({message: msg}, function(err) {
          if (err) reject(err);
          resolve();
        });
    });
  };

  this.getAll = function() {
    return execWithCollection(deadCollection, function(col, resolve, reject) {
      col.find(function(err, docs) {
        if (err) reject(err);
        resolve(docs);
      });
    });
  };
};
