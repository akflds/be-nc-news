const { fetchArticle } = require("../models/articles.model");
const { fetchCommentsByArticle } = require("../models/comments.model");

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;

  Promise.all([fetchArticle(article_id), fetchCommentsByArticle(article_id)])
    .then(([_, comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
