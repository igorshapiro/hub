// var webServer = require('./lib/web_server.js');

// new webServer().run();
var Hub = require('./lib/service_hub.js');
var hub = new Hub();

hub.run();
