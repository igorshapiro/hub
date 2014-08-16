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

  afterEach(function() {
    hub.close();
  });

  it("It delivers an event to subscriber", function(done) {
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
});
