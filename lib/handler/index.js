module.exports = function () {
	return {
		renderIndex: function (req, res) {
			db.TT.getEverySummary(req.session.idUser,function (err, result) {
				res.render("index.html.twig", {datas:result})
			})
		},

		render404: function (req, res) {
			res.render("404.html.twig")
		}
	}
}