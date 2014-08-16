module.exports = function(repo) {
  this.send = function(req, res) {
    var msg = req.body;
    var subscribers = repo.getSubscribers(msg.type);
    for (var s in subscribers) {
      subscribers[s].process(msg);
    }
    res.status(200).end();
  };
};
