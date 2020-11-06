module.exports = function (server, handler) {
	server.get('/', handler.renderIndex)

	server.get('*', handler.render404)
}