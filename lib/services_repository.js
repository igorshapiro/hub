module.exports = function(options) {
  var _ = require('underscore'),
      Service = require('./service.js'),
      when = require('when'),
      pool = require('./resource_pool.js');
  var self = this;

  function getManifest() {
    if (options.manifest) return options.manifest;
    if (process.env.MANIFEST) return require("./" + process.env.MANIFEST);
    throw new Error("Manifest location not specified");
  }

  options = options || {};
  this.manifest = getManifest();
  var services = _.map(this.manifest.services, function(serviceManifest, name) {
    serviceManifest.name = name;
    serviceManifest.repo = self;
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

  var messageOwners = {};
  // TODO: current implementation will scan the whole repository on each call
  // for messages that don't have publisher
  this.getMessageOwner = function(type) {
    /* jshint eqnull: true */
    if (messageOwners[type] == null) {
      messageOwners[type] = _.find(services, function(service) {
        return service.isPublishing(type);
      });
    }
    return messageOwners[type];
  };

  var actors = [];
  var Delivery = require('./actors/delivery.js');
  var Processor = require('./actors/processor.js');
  this.runServices = function() {
    for (var s in services) {
      var service = services[s];
      actors.push(new Delivery(service));
      actors.push(new Processor(service));
    }
  };

  this.stopServices = function() {
    console.log("Stopping services");
    return when.all([
      pool.publishers.closeAll(),
      pool.consumers.closeAll(),
      pool.deadStorage.closeAll()
    ]);
  };
};
