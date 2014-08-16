module.exports = function(options) {
  var _ = require('underscore'),
      Service = require('./service.js');

  options = options || {};
  this.manifest = options.manifest;
  var services = _.map(this.manifest.services, function(serviceManifest, name) {
    serviceManifest.name = name;
    serviceManifest.repo = this;
    return new Service({manifest: serviceManifest});
  });

  this.getSubscribers = function(type) {
    var subscribers = [];
    for (var s in services) {
      var service = services[s];
      if (service.isSubscriber(type)) subscribers.push(service);
    }
    return subscribers;
  };

  this.runServices = function() {
    for (var s in services) {
      services[s].run();
    }
  };

  this.stopServices = function() {
    for (var s in services) services[s].stop();
  };
};
