module.exports = function(app, repo) {
  var API = require('./controllers/api.js');
  var api = new API(repo);
  app.post('/api/v1/messages', api.send);
};
