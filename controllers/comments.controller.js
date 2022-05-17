const { fetchArticle } = require("../models/articles.model");
const { fetchCommentsByArticle } = require("../models/comments.model");

exports.getCommentsByArticle = (req, res, next) => {
  fetchCommentsByArticle(req.params.article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
