describe("ServiceHub", function(){
  var manifest = {
    services: {
      orders: {
        publish: ['order_completed']
      },
      billing: {
        subscribe: ['order_completed'],
        endpoint: 'http://bill.com/:message_type'
      }
    }
  };
  var hub = null;
  var repo = null;

  beforeEach(function() {
    hub = new Hub({manifest: manifest, drainQueues: true});
    repo = hub.services_repository;
  });

  afterEach(function(done) {
    hub.close().done(function() {
      require('../../lib/resource_pool.js').reset();
      done();
    });
  });

  it("delivers an event to subscriber", function(done) {
    var msg = {type: 'order_completed'};
    var fake = nock('http://bill.com')
      .post('/order_completed')
      .reply(200, function(uri, requestBody) {
        expect(JSON.parse(requestBody)).to.eql(msg);
        done();
      });
    request(hub.webApp)
      .post('/api/v1/messages')
      .send(msg)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.equal(null);
      });
  });

  describe("Failing handler", function() {
    var retries = 0;
    var msg = {type: 'order_completed', max_attempts: 10};
    var timeoutMillis = 200;

    function createFakeHandler() {
      return nock('http://bill.com')
        .post('/order_completed')
        .times(10)
        .reply(500, function(uri, body) {
          retries++;
        });
    }
    function publishMessage(msg) {
      request(hub.webApp).post('/api/v1/messages').send(msg)
        .end(function(err, res){
          expect(err).to.equal(null);
        });
    }

    it("retries message up to max_attempts times handler failed", function(done) {
      createFakeHandler();
      publishMessage(msg);

      setTimeout(function() {
        expect(retries).to.equal(msg.max_attempts);
        done();
      }, timeoutMillis);
    });

    it("Adds the message to dead storage", function(done) {
      var service = repo.getService("billing");
      var pool = require('./../../lib/resource_pool.js');

      createFakeHandler();
      publishMessage(msg);
      setTimeout(function() {
        pool.deadStorage.get(service)
          .then(function(storage) {
            return storage.getAll();
          })
          .then(function(deadMessages) {
            expect(deadMessages.length).to.equal(1);
            done();
          })
          .done();
      }, timeoutMillis);
    });
  });
});
