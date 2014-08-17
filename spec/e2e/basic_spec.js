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

  beforeEach(function() {
    hub = new Hub({manifest: manifest});
  });

  afterEach(function(done) {
    hub.close().done(function() { done(); });
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

  it("retries message up to max_attempts times handler failed", function(done) {
    var retries = 0;
    var msg = {type: 'order_completed', max_attempts: 10};
    var fake = nock('http://bill.com')
      .post('/order_completed')
      .times(10)
      .reply(500, function(uri, body) {
        retries++;
      });

    request(hub.webApp).post('/api/v1/messages').send(msg)
      .end(function(err, res){
        expect(err).to.equal(null);
      });

    setTimeout(function() {
      expect(retries).to.equal(msg.max_attempts);
      done();
    }, 100);
  });
});
