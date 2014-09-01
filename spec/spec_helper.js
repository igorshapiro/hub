// require('long-stack-traces');
var chai = require('chai'),
    sinonChai = require('sinon-chai');

var WebServer = require('./../lib/web_server.js');

global.ENV = 'test';
global.expect = chai.expect;
global.sinon = require('sinon');
global.debug = require('./../lib/debug.js');
global.request = require('supertest');
global.Hub = require('../lib/service_hub.js');
global.nock = require('nock');
chai.use(sinonChai);
