module.exports = function(options) {
  options = options || {};
  repo = options.repo;
  var port = parseInt(options.port || process.env.PORT || 8080);

  var express = require('express');
  this.app = express();
  this.app.use(require('body-parser').json());

  require('./routes.js')(this.app, repo);

  this.run = function() {
    this.app.listen(port, function(err) {
      if (err) throw err;

      console.log("Listening on port", port);
    });
  };
};
