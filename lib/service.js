module.exports = function(options) {
  options = options || {};
  this.manifest = options.manifest || {};
  this.subscribe = this.manifest.subscribe || [];
  this.publish = this.manifest.publish || [];
  this.endpoint = this.manifest.endpoint;

  this.isSubscriber = function(messageType) {
    for (var s in this.subscribe) {
      if (messageType == this.subscribe[s]) return true;
    }
    return false;
  }

  this.getMessageEndpoint = function(msg) {
    return this.endpoint
      .replace(':env', msg.env)
      .replace(':message_type', msg.type);
  }
}
