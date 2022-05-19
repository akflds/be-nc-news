const articlesRouter = require("express").Router();

const {
  getArticle,
  getArticles,
  postArticle,
  patchArticle,
} = require("../controllers/articles.controller");

const {
  getCommentsByArticle,
  postComment,
} = require("../controllers/comments.controller");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter.route("/:article_id").get(getArticle).patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticle)
  .post(postComment);

module.exports = articlesRouter;
