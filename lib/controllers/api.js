module.exports = function(repo) {
  var pool = require('./../resource_pool.js');

  this.send = function(req, res) {
    var msg = req.body;
    var owner = repo.getMessageOwner(msg.type);
    pool.publishers.get(owner)
      .then(function(publisher) {
        return publisher.enqueue(owner.out_queue, msg);
      })
      .done(function() {
        res.status(200).end();
      });
  };
};
