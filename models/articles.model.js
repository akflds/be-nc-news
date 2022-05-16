const db = require("../db/connection");

exports.fetchArticle = (article_id) => {
  const queryStr = `
  SELECT 
    users.name AS author,
    title,
    article_id,
    body,
    topic,
    created_at,
    votes
  FROM articles
  JOIN users ON articles.author = users.username
  WHERE article_id = $1;`;
  const queryVals = [article_id];

  return db.query(queryStr, queryVals).then((results) => {
    if (results.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found." });
    } else {
      return results.rows[0];
    }
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
      return results.rows[0];
    });
  } else {
    return Promise.reject({ status: 400, msg: "Bad request." });
  }
};
