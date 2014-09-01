
var mongojs = require('mongojs');
var assert = require('assert');
var EventEmitter = require('events');
var semver = require('semver');


/**
 * check mongojs version. it should be >= 0.9.10
 */
var mongojs_version = require('mongojs/package.json').version;
assert(semver.satisfies(mongojs_version, '>=0.9.10'), 'mongojs-logger depends on mongojs version >= 0.9.10');


/**
 * export the api to receive log listeners
 */
var events = new EventEmitter();

module.exports = function(listener) {
	events.on('dbop', listener);
};



/**
 * hook into mongojs collection methods
 */
var proto = mongojs.Collection.prototype; 

Object.keys(proto).forEach(function(name) { 
	if (isProxyCandidate(proto, name)) {
		proto[name] = createProxyMethod(name, proto[name]);
	}
});

function isProxyCandidate(proto, name) {
	if (name[0] === '_') return false; //exclude private members
	
	if (proto.__lookupGetter__(name)) return false; //we don't care getters
	
	if (typeof proto[name] === 'function') {
		return true; //we got one 
	}
	
	return false; //something else
};

function createProxyMethod(fnName, fn) {
	return function() {
		var args = arguments;
		
		var lastArg = null;
		var context = null;
		
		if (args.length) {
			lastArg = args[args.length-1];
		}
		
		//pop out if last argument is context object
		if (lastArg && lastArg.__type === 'context') {
			args = Array.prototype.slice.call(args, 0, -1);
			context = lastArg;
		}
		
		//invoke the original function
		var result = fn.apply(this, args);
		
		var nameTokens = this._name.split('.');
		
		//emit dbop event with details & context
		events.emit('dbop', {
			db: nameTokens[0],
			collection : nameTokens[1],
			method : fnName,
			args : args
		}, context);
		
		return result;
	};
};


