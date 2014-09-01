mongojs-logger
==============

[MongoJs](https://github.com/mafintosh/mongojs) is a simple and easy to use mongodb driver for node.js

And use mongojs-logger to easily log all the db operations for debugging.

###Use
```
var logger = require('mongojs-logger')

logger(function(op) {
  console.log('[db]', op.collection + '.' + op.method, op.args);
});
```

That's it.


###Install
```
npm install mongojs-logger
```

###How it works
Once you setup the log handler, then any db operation will fire the handler with necessary details to log.

```
db.comments.find({postId: 250}, function(err, comments) {
  //do stuff
});
```

And you can get a log for this operation (as how your handler prints it)
```
[db] comments.find {postId: 250}
```

###What's more
When building multi-tenant web applications in node.js, you may need to write logs with necessary details to isolate the all logs of a particular user, in a given session or a particular request.

To do this, ```mongojs-logger``` supports passing in a ```context``` object to your log handler.


When you pass in a context object as last argument to db operation, it will be passed on to your log handler.

```
db.comments.find({postId: 250}, function(err, comments) {
  //do stuff
}, context);
```

```
var logger = require('mongojs-logger')

logger(function(op, context) {
  console.log(context.userId, context.sessionId, context.requestId, '[db]', op.collection + '.' + op.method, op.args);
});
```

###Sample context object

```
var context = {
   requestId: r140,
   sessionId: s122,
   userId: 451,
   __type: 'context'
};
```

NOTE: Any object can be passed in as context object. It should just have ```__type``` field set.   
   

