const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const {
  getArticle,
  getArticles,
  patchArticle,
} = require("./controllers/articles.controller");
const { getUsers } = require("./controllers/users.controller");
const {
  getCommentsByArticle,
  postComment,
} = require("./controllers/comments.controller");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/users", getUsers);

app.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "Route not found." });
});

// Database error handler
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request." });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Not found." });
  } else {
    next(err);
  }
});

// Custom error handler
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error." });
});

module.exports = app;
