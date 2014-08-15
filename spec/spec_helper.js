var chai = require('chai'),
    sinonChai = require('sinon-chai');

var WebServer = require('./../lib/web_server.js');

global.expect = chai.expect;
global.sinon = require('sinon');
global.request = require('supertest');
global.Hub = require('../lib/service_hub.js');
global.fakeweb = require('node-fakeweb');
global.nock = require('nock');
chai.use(sinonChai);
