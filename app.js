var server = require('./lib/server'),
    handler = require('./lib/handler')()

require('./lib/router')(server, handler)

console.log( server.settings.port )
server.listen( server.settings.port )