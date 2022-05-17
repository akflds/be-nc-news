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
  ( SELECT CAST (COUNT(*) AS INTEGER) 
    FROM comments  
    WHERE comments.article_id = $1
  ) AS comment_count
  FROM articles AS a
  JOIN users ON a.author = users.username 
  WHERE a.article_id = $1`;
  const queryVals = [article_id];

  return db.query(queryStr, queryVals).then((results) => {
    if (results.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found." });
    } else {
      return results.rows[0];
    }
  });
};

exports.fetchArticles = () => {
  const queryStr = `
  SELECT
    users.name AS author,
    a.title,
    a.article_id,
    a.topic,
    a.created_at,
    a.votes,
    ( SELECT CAST (COUNT(*) AS INTEGER)
      FROM comments
      WHERE comments.article_id = a.article_id
    ) AS comment_count
  FROM articles AS a
  JOIN users ON a.author = users.username
  ORDER BY a.created_at DESC;
`;

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
