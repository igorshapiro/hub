module.exports = function(options) {
  var ServicesRepository = require('./services_repository.js');
  var repo = new ServicesRepository(options);

  repo.runServices();

  var WebServer = require('./web_server.js');
  var webServer = new WebServer({repo: repo});
  this.webApp = webServer.app;

  this.close = function() {
    repo.stopServices();
  };
};
