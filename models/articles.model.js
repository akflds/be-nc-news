const db = require("../db/connection");

exports.fetchArticle = (article_id) => {
  const queryStr = `
  SELECT
  users.name AS author,
  a.title,
  a.article_id,
  a.body,
  a.topic,
  a.created_at,
  a.votes,
  COUNT(comments.comment_id)::INT as comment_count
  FROM articles AS a
    LEFT JOIN users ON users.username = a.author
    LEFT JOIN comments ON comments.article_id = a.article_id
  WHERE a.article_id = $1
  GROUP BY a.article_id, a.title, users.username
  `;
  const queryVals = [article_id];

  return db.query(queryStr, queryVals).then((results) => {
    if (results.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found." });
    } else {
      return results.rows[0];
    }
  });
};

exports.fetchArticles = (sort_by = "created_at", order = "desc") => {
  const permittedSortOptions = [
    "created_at",
    "comment_count",
    "votes",
    "article_id",
  ];

  if (!permittedSortOptions.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad request." });
  }

  let queryStr = `
  SELECT
    users.name AS author,
    a.title,
    a.article_id,
    a.topic,
    a.created_at,
    a.votes,
    COUNT(comments.comment_id)::INT as comment_count
  FROM articles AS a
    LEFT JOIN users ON users.username = a.author
    LEFT JOIN comments ON comments.article_id = a.article_id
  GROUP BY a.article_id, a.title, users.username`;

  queryStr += ` ORDER BY ${sort_by} ${order}`;

  return db.query(queryStr).then((results) => {
    return results.rows;
  });
};

exports.updateArticle = (article_id, body) => {
  if (body.inc_votes) {
    const queryStr = `
    UPDATE articles 
    SET votes = votes + $1 
    WHERE article_id = $2
    RETURNING *;
    `;
    const queryVals = [body.inc_votes, article_id];
    return db.query(queryStr, queryVals).then((results) => {
      if (results.rows.length) {
        return results.rows[0];
      } else {
        return Promise.reject({ status: 404, msg: "Not found." });
      }
    });
  } else {
    return Promise.reject({ status: 400, msg: "Bad request." });
  }
};
