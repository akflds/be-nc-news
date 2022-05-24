const { fetchArticle } = require("../models/articles.model");
const {
  fetchCommentsByArticle,
  insertComment,
  updateComment,
  totalCommentsByArticle,
  removeComment,
} = require("../models/comments.model");

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;

  Promise.all([
    fetchArticle(article_id),
    fetchCommentsByArticle(article_id, limit, p),
    totalCommentsByArticle(article_id),
  ])
    .then(([_, comments, { total_count }]) => {
      if (p > total_count) {
        return Promise.reject({ status: 404, msg: "Page not found" });
      } else {
        res.status(200).send({ comments });
      }
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

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  updateComment(comment_id, req.body)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
};
