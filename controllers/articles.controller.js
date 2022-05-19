const {
  fetchArticles,
  fetchArticle,
  insertArticle,
  updateArticle,
} = require("../models/articles.model");

const { fetchTopics } = require("../models/topics.model");

exports.getArticle = (req, res, next) => {
  fetchArticle(req.params.article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const permittedQueries = ["sort_by", "order", "topic"];

  // throws error on invalid query (?sort=..., or ?topics)
  if (
    !Object.keys(req.query).every((query) => permittedQueries.includes(query))
  ) {
    throw { status: 400, msg: "Bad request." };
  }

  const { sort_by, order, topic } = req.query;
  Promise.all([fetchTopics(), fetchArticles(sort_by, order, topic)])
    .then(([topics, articles]) => {
      if (topic) {
        if (topics.find((ele) => ele.slug === topic)) {
          res.status(200).send({ articles });
        } else {
          return Promise.reject({ status: 404, msg: "Not found." });
        }
      } else {
        res.status(200).send({ articles });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  insertArticle(req.body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  updateArticle(req.params.article_id, req.body)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
