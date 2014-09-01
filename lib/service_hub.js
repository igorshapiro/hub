module.exports = function(options) {
  var ServicesRepository = require('./services_repository.js');
  var repo = this.services_repository = new ServicesRepository(options);

  repo.runServices();

  var WebServer = require('./web_server.js');
  var webServer = new WebServer({repo: repo});
  this.webApp = webServer.app;

  this.run = function() {
    webServer.run();
  };

  this.close = function() {
    return repo.stopServices();
  };
};
