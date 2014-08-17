module.exports = function(service) {
  var mongojs = require('mongojs');
  var dbName = "hub_" + service.name;
  var db = mongojs(dbName);

  this.kill = function(msg) {
    db.collection("dead").save(msg);
  };
};
