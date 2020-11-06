var express = require('express'),
    config = require('./config'),
    server;

server = express()
config.applyConfiguration(server)

module.exports = server