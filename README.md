```javascript
  this.app.get('/', function(req, res) {
    // res.send("{a: 1}");  // 10700
    // res.json({a: 1});    // 10700       11ms
    // res.end("");
    // res.end("{a: 1}");   // 18000
    res.end(JSON.stringify({a: 1}));  // 17000
  });
```
