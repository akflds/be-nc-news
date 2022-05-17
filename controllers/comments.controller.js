const { fetchArticle } = require("../models/articles.model");
const {
  fetchCommentsByArticle,
  insertComment,
} = require("../models/comments.model");

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

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([fetchArticle(article_id), insertComment(article_id, req.body)])
    .then(([_, comment]) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
