var express = require('express'),
    twig = require('twig')

// Export method to be compliant with Express 3.0
exports.applyConfiguration = function (app) {
    app.set('view engine', 'twig')
    app.use(express.static('public'))
    app.set('port', process.env.PORT || 8000)
}