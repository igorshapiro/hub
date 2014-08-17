var common = require('./common.js');

var published = 0;
var received = 0;
var start = new Date().getTime();

function eventsEmitter() {
  function incPublished() { published++; }
  for (var i = 0; i < 100; i++) {
    common.publish({type: 'order_completed'}, incPublished);
  }
  setTimeout(eventsEmitter, 200);
}
setTimeout(eventsEmitter, 500);
function dumpRate() {
  var now = new Date().getTime();
  var rate = 1.0 * (published + received) / ((now - start) / 1000);
  console.log(rate.toFixed(2), "msg/sec");
  setTimeout(dumpRate, 1000);
}
dumpRate();

common.eventHandler('/order_paid', function(req, res, callback) {
  received++;
  callback();
});
