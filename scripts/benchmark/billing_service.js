var common = require('./common.js');

common.eventHandler('/order_completed', function(req, res, callback) {
  // console.log("order_completed received");
  common.publish({type: 'order_paid'}, callback);
});
